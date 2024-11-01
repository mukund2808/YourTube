// options.js

// Note: Replace 'YOUR_API_KEY' with your actual API key, and consider storing it securely.
const API_KEY = '***REMOVED***';


let spaces = {};
let activeSpace = "Technical";
let channelCache = {};

// Load spaces from Chrome storage
chrome.storage.sync.get("spaces", (result) => {
    spaces = result.spaces || { "Technical": { keywords: [], channels: [] } };
    // Ensure activeSpace exists in spaces
    if (!spaces[activeSpace]) {
        activeSpace = Object.keys(spaces)[0];
    }
    renderSpaces();
    setActiveSpace(activeSpace);
});

// SVG code for icons
const deleteIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg>
`;

const editIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
</svg>
`;

function renderSpaces() {
    const spacesContainer = document.getElementById("spaces-container");
    spacesContainer.innerHTML = "";
    Object.keys(spaces).forEach(spaceName => {
        const spaceItem = document.createElement("div");
        spaceItem.className = "space-item";

        // Show as selected if active
        if (spaceName === activeSpace) {
            spaceItem.classList.add("active");
        }

        // Space name and inline edit
        const spaceNameContainer = document.createElement("span");
        spaceNameContainer.textContent = spaceName;
        spaceNameContainer.className = "space-name";

        spaceItem.appendChild(spaceNameContainer);

        // Icon container for edit and delete
        const iconContainer = document.createElement("div");
        iconContainer.className = "icon-container";

        // Edit icon for renaming
        const editIconContainer = document.createElement("div");
        editIconContainer.className = "edit-icon icon";
        editIconContainer.innerHTML = editIconSVG;
        editIconContainer.addEventListener("click", (e) => {
            e.stopPropagation();
            renameSpace(spaceName, spaceItem);
        });
        iconContainer.appendChild(editIconContainer);

        // Delete icon for deletion
        const deleteIconContainer = document.createElement("div");
        deleteIconContainer.className = "delete-icon icon";
        deleteIconContainer.innerHTML = deleteIconSVG;
        deleteIconContainer.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSpace(spaceName);
        });
        iconContainer.appendChild(deleteIconContainer);

        // Append icons on hover
        spaceItem.appendChild(iconContainer);
        spaceItem.addEventListener("click", () => setActiveSpace(spaceName));
        spacesContainer.appendChild(spaceItem);
    });
}


// Set active space and load its keywords and channels
function setActiveSpace(spaceName) {
    activeSpace = spaceName;
    renderKeywords();
    renderChannels();

    // Close any open dropdowns
    closeAllDropdowns();

    // Clear input fields
    document.getElementById('keyword-input').value = '';
    document.getElementById('channel-input').value = '';

    // Update active class on space items
    document.querySelectorAll(".space-item").forEach(item => {
        item.classList.toggle("active", item.querySelector('.space-name').textContent === spaceName);
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('.suggestions').forEach(suggestionBox => {
        suggestionBox.style.display = 'none';
    });
}

// Rename space
function renameSpace(spaceName, spaceItem) {
    const spaceNameContainer = spaceItem.querySelector(".space-name");
    const input = document.createElement("input");
    input.type = "text";
    input.value = spaceName;
    input.className = "rename-input";

    const saveRename = () => {
        const newName = input.value.trim();
        if (newName && newName !== spaceName) {
            if (!spaces[newName]) {
                spaces[newName] = spaces[spaceName];
                delete spaces[spaceName];
                chrome.storage.sync.set({ spaces }, () => {
                    renderSpaces();
                    setActiveSpace(newName);
                });
            } else {
                alert("A space with that name already exists.");
                spaceNameContainer.textContent = spaceName;
            }
        } else {
            spaceNameContainer.textContent = spaceName;
        }

        // Remove the input element to prevent further events
        input.remove();
    };

    // Remove the 'blur' event listener
    // input.addEventListener("blur", saveRename);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default behavior
            saveRename();
        }
    });

    spaceNameContainer.textContent = "";
    spaceNameContainer.appendChild(input);
    input.focus();
}


// Delete space with confirmation
function deleteSpace(spaceName) {
    if (confirm(`Are you sure you want to delete the space "${spaceName}"?`)) {
        delete spaces[spaceName];
        chrome.storage.sync.set({ spaces }, () => {
            renderSpaces();
            const remainingSpaces = Object.keys(spaces);
            if (remainingSpaces.length > 0) {
                setActiveSpace(remainingSpaces[0]);
            } else {
                // Handle case when no spaces are left
                activeSpace = null;
                // Clear keywords and channels displays
                document.getElementById("selected-keywords").innerHTML = "";
                document.getElementById("selected-channels").innerHTML = "";
            }
        });
    }
}

// Render keywords
function renderKeywords() {
    const selectedKeywordsContainer = document.getElementById("selected-keywords");
    selectedKeywordsContainer.innerHTML = "";
    if (activeSpace && spaces[activeSpace]) {
        spaces[activeSpace].keywords.forEach(keyword => {
            const keywordPill = document.createElement("div");
            keywordPill.className = "selected-item-pill";
            keywordPill.textContent = keyword;

            const removeIcon = document.createElement("span");
            removeIcon.className = "tag-close";
            removeIcon.textContent = "×";
            removeIcon.addEventListener("click", () => {
                removeItem(keyword, "keyword");
            });

            keywordPill.appendChild(removeIcon);
            selectedKeywordsContainer.appendChild(keywordPill);
        });
    }
}

// Render channels
function renderChannels() {
    const selectedChannelsContainer = document.getElementById("selected-channels");
    selectedChannelsContainer.innerHTML = "";
    if (activeSpace && spaces[activeSpace]) {
        spaces[activeSpace].channels.forEach(channel => {
            const channelPill = document.createElement("div");
            channelPill.className = "selected-item-pill";
            channelPill.textContent = channel.title;

            const removeIcon = document.createElement("span");
            removeIcon.className = "tag-close";
            removeIcon.textContent = "×";
            removeIcon.addEventListener("click", () => {
                removeItem(channel, "channel");
            });

            channelPill.appendChild(removeIcon);
            selectedChannelsContainer.appendChild(channelPill);
        });
    }
}

// Remove item from space
function removeItem(item, type) {
    const itemList = spaces[activeSpace][`${type}s`];
    const index = itemList.findIndex(existingItem => {
        if (type === 'channel') {
            return existingItem.channelId === item.channelId;
        } else {
            return existingItem === item;
        }
    });
    if (index > -1) {
        itemList.splice(index, 1);
        chrome.storage.sync.set({ spaces });
        if (type === "keyword") {
            renderKeywords();
        } else if (type === "channel") {
            renderChannels();
        }
    }
}

// Debounced function for handling input
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

// Add item to space
function addItem(item, type) {
    let sanitizedItem;
    if (type === "channel") {
        sanitizedItem = {
            title: sanitizeInput(item.title),
            channelId: item.channelId,
            thumbnail: item.thumbnail
        };
    } else {
        sanitizedItem = sanitizeInput(item);
    }

    const itemList = spaces[activeSpace][`${type}s`];
    const itemIdentifier = type === "channel" ? sanitizedItem.channelId : sanitizedItem.toLowerCase();

    // Check for duplicates
    const isDuplicate = itemList.some(existingItem => {
        const existingIdentifier = type === "channel" ? existingItem.channelId : existingItem.toLowerCase();
        return existingIdentifier === itemIdentifier;
    });

    if (!isDuplicate) {
        itemList.push(sanitizedItem);
        chrome.storage.sync.set({ spaces });
        if (type === "keyword") {
            renderKeywords();
        } else if (type === "channel") {
            renderChannels();
        }
    } else {
        alert(`This ${type} is already added.`);
    }
}

// Handle keyword input with debounce
document.getElementById("keyword-input").addEventListener("input", debounce(function (event) {
    const input = event.target.value ? event.target.value.toLowerCase() : "";
    const suggestions = ["JavaScript", "Python", "React", "Node.js", "Machine Learning", "HTML"]
        .filter(kw => kw.toLowerCase().includes(input));

    renderSuggestions(suggestions, "keyword");
}, 300));

function renderSuggestions(suggestions, type) {
    const suggestionsContainer = document.getElementById(`${type}-suggestions`);
    suggestionsContainer.innerHTML = ""; // Clear previous suggestions

    if (suggestions.length === 0) {
        const noSuggestionItem = document.createElement("div");
        noSuggestionItem.className = "suggestion-item no-suggestion";
        noSuggestionItem.textContent = "No suggestions found";
        suggestionsContainer.appendChild(noSuggestionItem);
    } else {
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement("div");
            suggestionItem.className = "suggestion-item";
            if (type === "channel") {
                suggestionItem.innerHTML = `
                    <img src="${suggestion.thumbnail}" alt="${suggestion.title}" class="suggestion-thumbnail">
                    <div class="suggestion-details">
                        <span class="suggestion-title">${suggestion.title}</span>
                        <span class="suggestion-subscribers">${formatSubscriberCount(suggestion.subscriberCount)} subscribers</span>
                    </div>
                `;
            } else {
                suggestionItem.textContent = suggestion;
            }
            suggestionItem.addEventListener("click", () => {
                addItem(suggestion, type);
                document.getElementById(`${type}-input`).value = "";
                suggestionsContainer.style.display = "none";
            });
            suggestionsContainer.appendChild(suggestionItem);
        });
    }

    // Show the suggestions container
    suggestionsContainer.style.display = "block";

    // Adjust dropdown position
    adjustDropdownPosition(suggestionsContainer);
}


document.getElementById("keyword-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const keyword = this.value.trim();
        if (keyword) {
            addItem(keyword, "keyword");
            this.value = "";
            document.getElementById("keyword-suggestions").style.display = "none";
        }
    }
});

// Channel input handling
document.getElementById("channel-input").addEventListener("input", debounce(async function () {
    const query = this.value.trim();
    if (query.length > 2) {
        const channels = await fetchYouTubeChannels(query);
        renderSuggestions(channels, "channel");
    } else {
        document.getElementById("channel-suggestions").style.display = "none";
    }
}, 500));

document.getElementById("channel-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        // If suggestions are visible and a suggestion is highlighted, select it
        const suggestionsContainer = document.getElementById('channel-suggestions');
        if (suggestionsContainer.style.display === 'block') {
            const activeItem = suggestionsContainer.querySelector('.suggestion-active');
            if (activeItem) {
                activeItem.click();
                return;
            }
        }
        // Otherwise, add the channel name as is (without channelId)
        const channelName = this.value.trim();
        if (channelName) {
            addItem({ title: channelName, channelId: null }, "channel");
            this.value = "";
            suggestionsContainer.style.display = "none";
        }
    }
});

function enableSuggestionNavigation(inputId, suggestionsId) {
    const inputElement = document.getElementById(inputId);
    const suggestionsElement = document.getElementById(suggestionsId);
    let currentFocus = -1;

    inputElement.addEventListener('keydown', function(event) {
        const suggestionItems = suggestionsElement.getElementsByClassName('suggestion-item');

        if (event.key === 'ArrowDown') {
            currentFocus++;
            addActive(suggestionItems);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            currentFocus--;
            addActive(suggestionItems);
            event.preventDefault();
        } else if (event.key === 'Enter') {
            if (currentFocus > -1) {
                event.preventDefault();
                suggestionItems[currentFocus].click();
                currentFocus = -1;
            }
        } else if (event.key === 'Escape') {
            suggestionsElement.style.display = 'none';
            currentFocus = -1;
        } else {
            currentFocus = -1;
        }
    });

    function addActive(items) {
        if (!items || items.length === 0) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus].classList.add('suggestion-active');
    }

    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('suggestion-active');
        }
    }
}

// Apply to both keyword and channel inputs
enableSuggestionNavigation('keyword-input', 'keyword-suggestions');
enableSuggestionNavigation('channel-input', 'channel-suggestions');

document.addEventListener('click', function(event) {
    const keywordInput = document.getElementById('keyword-input');
    const keywordSuggestions = document.getElementById('keyword-suggestions');
    const channelInput = document.getElementById('channel-input');
    const channelSuggestions = document.getElementById('channel-suggestions');

    if (!keywordInput.contains(event.target) && !keywordSuggestions.contains(event.target)) {
        keywordSuggestions.style.display = 'none';
    }

    if (!channelInput.contains(event.target) && !channelSuggestions.contains(event.target)) {
        channelSuggestions.style.display = 'none';
    }
});

// Fetch YouTube channels with caching and error handling
async function fetchYouTubeChannels(query) {
    if (channelCache[query]) {
        return channelCache[query];
    }

    const suggestionsContainer = document.getElementById('channel-suggestions');
    suggestionsContainer.innerHTML = '<div class="loading">Loading...</div>';
    suggestionsContainer.style.display = 'block';

    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${API_KEY}`;
        const searchResponse = await fetchWithRetry(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.items && Array.isArray(searchData.items) && searchData.items.length > 0) {
            const channelIds = searchData.items.map(item => item.snippet.channelId || item.id.channelId);

            // Fetch channel statistics
            const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelIds.join(',')}&key=${API_KEY}`;
            const channelsResponse = await fetchWithRetry(channelsUrl);
            const channelsData = await channelsResponse.json();

            if (channelsData.items && Array.isArray(channelsData.items) && channelsData.items.length > 0) {
                const channels = channelsData.items.map(item => ({
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails.default.url,
                    channelId: item.id,
                    subscriberCount: item.statistics.subscriberCount
                }));

                channelCache[query] = channels;
                return channels;
            } else {
                console.error("No channel data found for the query.");
                return [];
            }
        } else {
            console.error("No search results found for the query.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching YouTube channels:", error);
        alert("Unable to fetch channel suggestions at this time. Please try again later.");
        return [];
    }
}

function formatSubscriberCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    } else {
        return count;
    }
}


// Retry function for API requests
async function fetchWithRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
        }
    }
}


// Footer Hover Effect and Click Event
document.addEventListener('DOMContentLoaded', function() {
    const hoverText = document.getElementById('hover-text');

    // Store the original text
    const originalText = hoverText.textContent;

    // Event listeners for hover effect
    hoverText.addEventListener('mouseenter', function() {
        hoverText.textContent = "Go to Mukund's Github";
    });

    hoverText.addEventListener('mouseleave', function() {
        hoverText.textContent = originalText;
    });

    // Click event to open the link in a new tab
    hoverText.addEventListener('click', function() {
        window.open('https://github.com/mukund2808/', '_blank');
    });
});


// Event listeners for Save and Clear buttons
document.getElementById("save-keywords-btn").addEventListener("click", () => {
    chrome.storage.sync.set({ spaces }, () => {
        alert("Keywords saved successfully!");
    });
});

document.getElementById("clear-keywords-btn").addEventListener("click", () => {
    spaces[activeSpace].keywords = [];
    chrome.storage.sync.set({ spaces });
    renderKeywords();
    document.getElementById('keyword-input').value = '';
    closeAllDropdowns();
});

document.getElementById("save-channels-btn").addEventListener("click", () => {
    chrome.storage.sync.set({ spaces }, () => {
        alert("Channels saved successfully!");
    });
});

document.getElementById("clear-channels-btn").addEventListener("click", () => {
    spaces[activeSpace].channels = [];
    chrome.storage.sync.set({ spaces });
    renderChannels();
    document.getElementById('channel-input').value = '';
    closeAllDropdowns();
});

// Add Space functionality
document.getElementById("add-space").addEventListener("click", () => {
    let spaceName = prompt("Enter the name of the new space:");
    if (spaceName) {
        spaceName = spaceName.trim();
        if (spaceName && !spaces[spaceName]) {
            spaces[spaceName] = { keywords: [], channels: [] };
            chrome.storage.sync.set({ spaces }, () => {
                renderSpaces();
                setActiveSpace(spaceName);
            });
        } else if (spaces[spaceName]) {
            alert("A space with that name already exists.");
        }
    }
});

// Add Escape key listener to close suggestions
function addEscapeKeyListener(inputId, suggestionsId) {
    const inputElement = document.getElementById(inputId);
    const suggestionsElement = document.getElementById(suggestionsId);

    inputElement.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            suggestionsElement.style.display = 'none';
        }
    });
}

// Apply to both keyword and channel inputs
addEscapeKeyListener('keyword-input', 'keyword-suggestions');
addEscapeKeyListener('channel-input', 'channel-suggestions');


function adjustDropdownPosition(suggestionsContainer) {
    const rect = suggestionsContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = windowHeight - rect.top;
    const spaceAbove = rect.top;

    // Check if the dropdown fits below the input
    if (spaceBelow < suggestionsContainer.offsetHeight && spaceAbove > spaceBelow) {
        suggestionsContainer.style.bottom = '100%';
        suggestionsContainer.style.top = 'auto';
    } else {
        suggestionsContainer.style.top = '100%';
        suggestionsContainer.style.bottom = 'auto';
    }
}



