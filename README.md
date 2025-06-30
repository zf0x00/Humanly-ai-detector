# GoWinston AI Content Analyzer Chrome Extension

A powerful Chrome extension that analyzes blog content using the GoWinston AI API to detect AI-generated content, assess readability, and identify potential security risks.

## Features

- **AI Content Detection**: Identifies AI-generated content with probability scores
- **Readability Analysis**: Evaluates content readability and reading level
- **Security Scanning**: Detects potential security threats and attacks
- **Sentence-Level Analysis**: Provides detailed analysis for individual sentences
- **Non-Intrusive Widget**: Floating widget that doesn't interfere with page content
- **Smart Caching**: Caches results to minimize API calls and improve performance
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension will be available on the Chrome Web Store*

### Manual Installation (Developer Mode)

1. **Download the Extension**
   - Download or clone this repository
   - Extract the files to a folder on your computer

2. **Enable Developer Mode**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "GoWinston AI Content Analyzer" and click the pin icon

## Setup

1. **Get Your API Token**
   - Visit [GoWinston Dashboard](https://app.gowinston.ai/dashboard)
   - Sign up or log in to your account
   - Navigate to the API section and generate an API token

2. **Configure the Extension**
   - Click the GoWinston extension icon in Chrome's toolbar
   - Enter your API token in the setup dialog
   - Click "Save" to validate and store your token

## Usage

### Automatic Analysis
- The extension automatically detects blog-like content on web pages
- A floating widget appears in the bottom-right corner when analysis is available
- Analysis begins automatically after page load (with a 1-second debounce)

### Widget Features
- **Minimize/Maximize**: Click the minimize button to collapse the widget
- **Drag to Move**: Drag the widget header to reposition it
- **Close**: Click the X button to hide the widget
- **Detailed Analysis**: Click "View Detailed Analysis" for comprehensive results

### Interpreting Results

#### AI Detection Score
- **0-30%**: Low probability of AI generation (green)
- **31-70%**: Medium probability of AI generation (yellow)  
- **71-100%**: High probability of AI generation (red)

#### Readability Score
- Higher scores indicate better readability
- Scores are based on standard readability metrics

#### Security Status
- **Secure**: No security threats detected
- **Risk Detected**: Potential security issues found

## Supported Websites

The extension works on most websites but is optimized for:
- Blog platforms (WordPress, Medium, Substack, etc.)
- News websites
- Article pages
- Content management systems
- Any page with substantial text content

## Privacy & Security

- **Data Processing**: Content is sent to GoWinston AI for analysis
- **API Token**: Stored securely in Chrome's sync storage
- **Caching**: Analysis results are cached locally for 5 minutes
- **No Data Collection**: This extension doesn't collect personal data

## API Rate Limits

- The extension implements intelligent caching to minimize API calls
- Results are cached for 5 minutes per unique URL
- Failed requests include automatic retry logic

## Troubleshooting

### Widget Not Appearing
- Ensure you're on a page with substantial text content
- Check that your API token is configured correctly
- Verify the website isn't blocked by content security policies

### API Errors
- **401 Unauthorized**: Check your API token in the extension popup
- **Rate Limited**: Wait a few minutes before retrying
- **Network Error**: Check your internet connection

### Clear Cache
- Open the extension popup
- Click "Clear Cache" to remove stored analysis results
- This forces fresh analysis on next page visit

## Development

### File Structure
```
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content-script.js      # Main content script
├── widget.css            # Widget styling
├── popup.html            # Extension popup
├── popup.css             # Popup styling  
├── popup.js              # Popup functionality
└── README.md             # Documentation
```

### Building for Production
1. Update version in `manifest.json`
2. Test thoroughly in developer mode
3. Create a ZIP file of all extension files
4. Submit to Chrome Web Store

## Support

For support, bug reports, or feature requests:
- Visit [GoWinston Support](https://gowinston.ai/support)
- Email: support@gowinston.ai
- GitHub Issues: Create an issue in this repository

## License

This extension is provided under the MIT License. See LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release
- AI content detection
- Readability analysis
- Security scanning
- Floating widget interface
- Sentence-level analysis
- Performance optimizations

---

**Note**: This extension requires a valid GoWinston AI API token to function. Visit [gowinston.ai](https://gowinston.ai) to learn more about the service and obtain an API token.