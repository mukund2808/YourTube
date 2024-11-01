// Log when the content script loads
console.log("Content script loaded");

// Function to initialize filtering based on toggle state
function initializeFiltering() {
    chrome.storage.sync.get(["toggleState", "spaces", "activeSpace"], (result) => {
        const toggleState = result.toggleState || "OFF";
        const activeSpaceName = result.activeSpace || Object.keys(result.spaces || {})[0];
        const { chosenKeywords, chosenChannels } = getChosenFilters(result.spaces, activeSpaceName);

        if (toggleState === "ON" && (chosenKeywords.length > 0 || chosenChannels.length > 0)) {
            console.log("Filtering enabled.");
            observePageForVideos(chosenKeywords, chosenChannels);
            filterYouTubeContent(chosenKeywords, chosenChannels); // Run initial filter
        } else {
            console.log("Filtering disabled or no keywords/channels provided.");
            resetYouTube(); // Remove any existing filters if toggle is OFF or no keywords/channels
        }
    });
}

// Helper function to get keywords and channels from active space
function getChosenFilters(spaces, activeSpaceName) {
    const activeSpace = spaces?.[activeSpaceName] || { keywords: [], channels: [] };
    const chosenKeywords = activeSpace.keywords || [];
    const chosenChannels = activeSpace.channels || [];
    return { chosenKeywords, chosenChannels };
}

// Function to observe YouTube container for dynamically loaded content
function observePageForVideos(keywords, channels) {
    const targetNode = document.querySelector('ytd-page-manager') || document.body;
    const observer = new MutationObserver(() => {
        observer.disconnect(); // Temporarily disconnect to prevent excessive triggers
        filterYouTubeContent(keywords, channels);
        setTimeout(() => observer.observe(targetNode, { childList: true, subtree: true }), 1000); // Reconnect after 1 second
    });

    observer.observe(targetNode, { childList: true, subtree: true });
    console.log("Started observing specific container for new content.");
}

// Function to filter YouTube videos based on keywords and channels
function filterYouTubeContent(keywords, channels) {
    console.log("Running filterYouTubeContent function");

    const videos = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ytd-video-preview');
    console.log("Number of videos detected:", videos.length);

    // Log stored channel names
    console.log("Stored Channels:", channels.map(channel => channel.title));

    videos.forEach(video => {
        try {
            const titleElement = video.querySelector('#video-title') || video.querySelector('#video-title-link');
            const title = titleElement ? titleElement.textContent.trim() : "";

            // Retrieve channel name
            let channelName = "";
            try {
                const channelNameElement = video.querySelector('#channel-name') || video.querySelector('.ytd-channel-name');
                if (channelNameElement) {
                    const channelLinkElement = channelNameElement.querySelector('a');
                    if (channelLinkElement) {
                        channelName = channelLinkElement.textContent.trim();
                    }
                }

                // Alternative method to get channel name
                if (!channelName) {
                    const ownerElement = video.querySelector('ytd-video-owner-renderer');
                    if (ownerElement) {
                        const ownerLink = ownerElement.querySelector('a');
                        if (ownerLink) {
                            channelName = ownerLink.textContent.trim();
                        }
                    }
                }
            } catch (err) {
                console.error("Error extracting channel name:", err);
            }

            // Normalize the extracted channel name
            const normalizedExtractedName = normalizeString(channelName);

            // Log for debugging
            console.log(`Video Title: "${title}", Extracted Channel Name: "${channelName}", Normalized: "${normalizedExtractedName}"`);

            const isKeywordMatch = matchesKeywords(title, keywords);
            const isChannelMatch = matchesChannels(normalizedExtractedName, channels);

            console.log(`Match Result - Title: "${title}", Channel: "${channelName}" - ${isChannelMatch ? "Channel Match" : isKeywordMatch ? "Keyword Match" : "No Match"}`);

            if (isChannelMatch) {
                unblurVideo(video);
                console.log("Video from selected channel (visible):", title);
            } else if (isKeywordMatch) {
                unblurVideo(video);
                console.log("Video matches keyword (visible):", title);
            } else {
                blurVideo(video);
                console.log("Non-matching video (blurred):", title);
            }
        } catch (error) {
            console.error("Error processing video:", error);
        }
    });
}

// Helper function to check if a title matches any keyword as a whole word
function matchesKeywords(title, keywords) {
    return keywords.some(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(title);
    });
}

function normalizeString(str) {
    return str
        .toLowerCase()
        .replace(/\s+/g, ' ')      // Replace multiple whitespace with single space
        .trim()
        .normalize('NFKD')          // Normalize Unicode characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s]/gi, '');  // Remove special characters
}

// Helper function to check if a channel matches any chosen channel by channelId
// Helper function to check if a channel matches any chosen channel by channel name
function matchesChannels(channelName, channels) {
    if (!channelName) return false;

    // Normalize the extracted channel name
    const normalizedExtractedName = normalizeString(channelName);

    return channels.some(channel => {
        // Normalize the stored channel name
        const normalizedStoredName = normalizeString(channel.title);

        // Check for exact match or inclusion
        return normalizedStoredName === normalizedExtractedName ||
               normalizedExtractedName.includes(normalizedStoredName) ||
               normalizedStoredName.includes(normalizedExtractedName);
    });
}


// Helper function to extract channel ID from URL
// Helper function to extract channel ID from URL
function getChannelIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        // For channels in the format /channel/CHANNEL_ID
        let match = pathname.match(/^\/channel\/([a-zA-Z0-9_-]+)$/);
        if (match) {
            return match[1];
        }

        // For channels in the format /user/USERNAME
        match = pathname.match(/^\/user\/([a-zA-Z0-9_-]+)$/);
        if (match) {
            return match[1];
        }

        // For channels in the format /c/CUSTOM_NAME
        match = pathname.match(/^\/c\/([a-zA-Z0-9_-]+)$/);
        if (match) {
            return match[1];
        }

        // For channels in the format /@HANDLE
        match = pathname.match(/^\/@([a-zA-Z0-9_-]+)$/);
        if (match) {
            return '@' + match[1];
        }
    } catch (e) {
        console.error('Error parsing channel URL:', url, e);
    }
    return null;
}


// Function to blur a video element
function blurVideo(video) {
    video.style.filter = 'blur(8px)';
    video.style.opacity = '0.5';
    video.style.pointerEvents = 'none';
    video.style.cursor = 'not-allowed';
    video.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
}

// Function to unblur a video element
function unblurVideo(video) {
    video.style.filter = 'none';
    video.style.opacity = '1';
    video.style.pointerEvents = 'auto';
    video.style.cursor = 'pointer';
    video.style.backgroundColor = ''; // Remove background styling
}

// Function to reset all videos (remove blurring and interaction restrictions)
function resetYouTube() {
    const videos = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ytd-video-preview');
    videos.forEach(video => {
        unblurVideo(video);
    });
    console.log("YouTube reset to normal state.");
}
// Listen for storage changes to toggle filtering in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.toggleState || changes.spaces || changes.activeSpace)) {
        console.log("Storage changed, reinitializing filtering.");
        initializeFiltering();
    }
});

// Listen for messages from popup to enable/disable filtering
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.toggleState) {
        console.log("Received toggle state:", request.toggleState);
        if (request.toggleState === "ON") {
            initializeFiltering();
        } else {
            resetYouTube();
        }
        sendResponse({ status: "success" });
    }
});

// Initialize filtering on script load
initializeFiltering();
