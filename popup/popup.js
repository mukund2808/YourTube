document.addEventListener('DOMContentLoaded', function () {
    const filterToggle = document.getElementById('filter-toggle');
    const statusText = document.getElementById('status-text');
    const settingsBtn = document.getElementById('settings-btn');

    // Load the saved state
    chrome.storage.sync.get(['toggleState'], function (result) {
        const toggleState = result.toggleState || 'OFF';
        filterToggle.checked = toggleState === 'ON';
        statusText.textContent = toggleState === 'ON' ? 'On' : 'Off';
    });

    // Update the state when the toggle changes
    filterToggle.addEventListener('change', function () {
        const newState = filterToggle.checked ? 'ON' : 'OFF';
        statusText.textContent = newState === 'ON' ? 'On' : 'Off';

        chrome.storage.sync.set({ 'toggleState': newState }, () => {
            console.log('Toggle state saved:', newState);
        });

        // Send a message to the content script if the tab is a YouTube page
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].url.includes('youtube.com')) { // Check if tab is YouTube
                chrome.tabs.sendMessage(tabs[0].id, { toggleState: newState }, function (response) {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Response:', response);
                    }
                });
            } else {
                console.log('The current tab is not a YouTube page. Message not sent.');
            }
        });
    });

    // Open settings page
    settingsBtn.addEventListener('click', function () {
        chrome.runtime.openOptionsPage();
    });
});

  
