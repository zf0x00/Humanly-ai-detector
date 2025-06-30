// Background service worker for the Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("GoWinston AI Content Analyzer installed");
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeContent") {
    analyzeContent(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
});

async function analyzeContent(contentData) {
  console.log(contentData, "contentData");
  try {
    // Get API token from storage
    // const { apiToken } = await chrome.storage.sync.get(['apiToken']);

    // if (!apiToken) {
    //   throw new Error('API token not configured. Please add your GoWinston API token in the extension popup.');
    // }

    console.log(
      JSON.stringify({
        website: contentData.url,
        sentences: false,
        language: contentData.language || "en",
        // text: contentData.content
      }),
      "apiToken"
    );

    const response = await fetch(
      "https://api.sapling.ai/api/v1/aidetect",
      {
        method: "POST",
        headers: {
          // Authorization: `Bearer Ig5ZvdwgA7anZdaWvg9PgAGgtuJj8SvqyIxbxLqqace3a0eb`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          key: "8PFIRCDHIATH0NJ28QDC1BYUOCC4MVU3",
          text: contentData.content,
          // sentences: false,
          // language: contentData.language || "en",
          // text: contentData.content
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    console.log(result, "result");

    // Cache the result
    const cacheKey = `analysis_${btoa(contentData.url)}`;
    await chrome.storage.local.set({
      [cacheKey]: {
        data: result,
        timestamp: Date.now(),
        url: contentData.url,
      },
    });

    return result;
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw error;
  }
}

// Global variable to track activation state
let isActive = true;

// Listen for activation/deactivation messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "activate") {
    isActive = true;
    console.log("Extension activated");
  } else if (message.action === "deactivate") {
    isActive = false;
    console.log("Extension deactivated");
  }
});

// Modify content analysis to respect activation state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeContent") {
    if (!isActive) {
      sendResponse({
        success: false,
        error: "Extension is currently deactivated",
      });
      return true;
    }

    analyzeContent(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
