// Content script that runs on web pages
class GoWinstonAnalyzer {
  constructor() {
    this.widget = null;
    this.isAnalyzing = false;
    this.analysisCache = new Map();
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    // Only run on blog-like websites
    if (this.isBlogLikePage()) {
      this.createWidget();
      this.setupEventListeners();
      console.log('[GoWinstonAnalyzer]');
      // Debounced analysis on page load
      this.debounceAnalysis();
    }
  }

  isBlogLikePage() {
    const url = window.location.href.toLowerCase();
    const content = document.body.textContent || '';
    
    // Check for blog indicators
    const blogIndicators = [
      'blog', 'article', 'post', 'news', 'medium.com', 'wordpress',
      'blogger', 'substack', 'dev.to', 'hashnode'
    ];
    
    const hasBlogIndicator = blogIndicators.some(indicator => 
      url.includes(indicator) || content.includes(indicator)
    );
    
    // Check content length (blogs typically have substantial content)
    const hasSubstantialContent = content.trim().split(/\s+/).length > 200;
    
    // Check for article-like structure
    const hasArticleStructure = document.querySelector('article, .article, .post, .blog-post, h1, h2');
    
    return hasBlogIndicator || (hasSubstantialContent && hasArticleStructure);
  }

  createWidget() {
    // Create widget container
    this.widget = document.createElement('div');
    this.widget.id = 'gowinston-widget';
    this.widget.className = 'gowinston-widget';
    
    this.widget.innerHTML = `
      <div class="gowinston-header">
        <div class="gowinston-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <span>Humanly AI</span>
        </div>
        <div class="gowinston-controls">
          <button id="gowinston-minimize" class="gowinston-btn-icon" title="Minimize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button id="gowinston-close" class="gowinston-btn-icon" title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="gowinston-content">
        <div id="gowinston-loading" class="gowinston-loading">
          <div class="gowinston-spinner"></div>
          <p>Analyzing content...</p>
        </div>
        <div id="gowinston-results" class="gowinston-results" style="display: none;">
          <div class="gowinston-metrics">
            <div class="gowinston-metric">
              <div class="gowinston-metric-label">AI Detection</div>
              <div class="gowinston-metric-value" id="ai-score">-</div>
            </div>
            <div class="gowinston-metric">
              <div class="gowinston-metric-label">Readability</div>
              <div class="gowinston-metric-value" id="readability-score">-</div>
            </div>
            <div class="gowinston-metric">
              <div class="gowinston-metric-label">Security</div>
              <div class="gowinston-metric-value" id="security-status">-</div>
            </div>
          </div>
          <div class="gowinston-details" style="display: none;">
            <button id="gowinston-view-details" class="gowinston-btn-primary">
              View Detailed Analysis
            </button>
          </div>
        </div>
        <div id="gowinston-error" class="gowinston-error" style="display: none;">
          <p id="error-message">An error occurred</p>
          <button id="gowinston-retry" class="gowinston-btn-secondary">Retry Analysis</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.widget);
  }

  setupEventListeners() {
    // Minimize/Maximize toggle
    const minimizeBtn = this.widget.querySelector('#gowinston-minimize');
    minimizeBtn.addEventListener('click', () => {
      this.widget.classList.toggle('minimized');
    });

    // Close widget
    const closeBtn = this.widget.querySelector('#gowinston-close');
    closeBtn.addEventListener('click', () => {
      this.widget.style.display = 'none';
    });

    // Retry button
    const retryBtn = this.widget.querySelector('#gowinston-retry');
    retryBtn.addEventListener('click', () => {
      this.analyzeContent();
    });

    // View details button
    const detailsBtn = this.widget.querySelector('#gowinston-view-details');
    detailsBtn.addEventListener('click', () => {
      this.showDetailedAnalysis();
    });

    // Make widget draggable
    this.makeDraggable();
  }

  makeDraggable() {
    const header = this.widget.querySelector('.gowinston-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.gowinston-controls')) return;
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
      header.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        
        this.widget.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'grab';
    });
  }

  debounceAnalysis() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.analyzeContent();
    }, 1000);
  }

  async analyzeContent() {
    const url = window.location.href;
    
    // Check cache first
    const cacheKey = btoa(url);
    const cached = this.analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      this.displayResults(cached.data);
      return;
    }

    this.showLoading();
    this.isAnalyzing = true;

    try {
      const content = this.extractContent();
      const language = this.detectLanguage();

      const response = await chrome.runtime.sendMessage({
        action: 'analyzeContent',
        data: {
          url,
          content,
          language
        }
      });

      if (response.success) {
        // Cache the result
        this.analysisCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
        console.log(response.data, "response.data");
        
        this.displayResults(response.data);
      } else {
        this.showError(response.error);
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.isAnalyzing = false;
    }
  }

  extractContent() {
    // Try to extract main content from common selectors
    const contentSelectors = [
      'article',
      '.article',
      '.post',
      '.blog-post',
      '.entry-content',
      '.content',
      'main',
      '[role="main"]'
    ];

    let content = '';
    
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = element.textContent || element.innerText || '';
        break;
      }
    }

    // Fallback to body content if no specific content area found
    if (!content.trim()) {
      content = document.body.textContent || document.body.innerText || '';
    }

    // Clean up the content
    return content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit content length
  }

  detectLanguage() {
    const htmlLang = document.documentElement.lang;
    if (htmlLang) return htmlLang.toLowerCase().substring(0, 2);
    
    // Default to English
    return 'en';
  }

  showLoading() {
    this.widget.querySelector('#gowinston-loading').style.display = 'block';
    this.widget.querySelector('#gowinston-results').style.display = 'none';
    this.widget.querySelector('#gowinston-error').style.display = 'none';
  }

  displayResults(data) {
    const loading = this.widget.querySelector('#gowinston-loading');
    const results = this.widget.querySelector('#gowinston-results');
    const error = this.widget.querySelector('#gowinston-error');

    loading.style.display = 'none';
    error.style.display = 'none';
    results.style.display = 'block';

    // Update metrics
    const aiScore = Math.round((data.score || 0) * 100);
    const readabilityScore = data.readabilityScore || 'N/A';
    const securityStatus = data.attackDetected ? 'Risk Detected' : 'Secure';

    this.widget.querySelector('#ai-score').textContent = `${Math.round(data.score).toFixed(3)}%`;
    this.widget.querySelector('#readability-score').textContent = readabilityScore;
    this.widget.querySelector('#security-status').textContent = securityStatus;

    // Style based on scores
    const aiScoreElement = this.widget.querySelector('#ai-score');
    if (aiScore > 70) {
      aiScoreElement.className = 'gowinston-metric-value high-risk';
    } else if (aiScore > 30) {
      aiScoreElement.className = 'gowinston-metric-value medium-risk';
    } else {
      aiScoreElement.className = 'gowinston-metric-value low-risk';
    }

    const securityElement = this.widget.querySelector('#security-status');
    securityElement.className = data.attackDetected ? 
      'gowinston-metric-value high-risk' : 
      'gowinston-metric-value low-risk';

    // Store detailed data for modal
    this.detailedData = data;
  }

  showError(message) {
    const loading = this.widget.querySelector('#gowinston-loading');
    const results = this.widget.querySelector('#gowinston-results');
    const error = this.widget.querySelector('#gowinston-error');

    loading.style.display = 'none';
    results.style.display = 'none';
    error.style.display = 'block';

    this.widget.querySelector('#error-message').textContent = message;
  }

  showDetailedAnalysis() {
    if (!this.detailedData) return;
    const cacheKey = `analysis_${btoa(url)}`; // or contentData.url, depending on your usage

    chrome.storage.local.get(cacheKey, (result) => {
      this.detailedData = result[cacheKey];
    });

    console.log(this.detailedData, "this.detailedData");

    // Create detailed analysis modal
    const modal = document.createElement('div');
    modal.className = 'gowinston-modal';
    modal.innerHTML = `
      <div class="gowinston-modal-content">
        <div class="gowinston-modal-header">
          <h2>Detailed Analysis</h2>
          <button class="gowinston-btn-icon" id="close-modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="gowinston-modal-body">
          <div class="gowinston-analysis-section">
            <h3>AI Detection Analysis</h3>
            // <p><strong>Overall AI Probability:</strong> ${Math.round((this.detailedData.aiProbability || 0) * 100)}%</p>
            <p><strong>Overall AI Probability:</strong> ${chrome.storage.local.get(`analysis_${btoa(contentData.url)}`) || 'N/A'}%</p>
            <p><strong>Confidence Level:</strong> ${chrome.storage.local.get(`analysis_${btoa(contentData.url)}`) || 'N/A'}</p>
          </div>
          
          <div class="gowinston-analysis-section">
            <h3>Readability Metrics</h3>
            <p><strong>Readability Score:</strong> ${this.detailedData.readabilityScore || 'N/A'}</p>
            <p><strong>Reading Level:</strong> ${this.detailedData.readingLevel || 'N/A'}</p>
          </div>
          
          <div class="gowinston-analysis-section">
            <h3>Security Analysis</h3>
            <p><strong>Attack Detected:</strong> ${this.detailedData.attackDetected ? 'Yes' : 'No'}</p>
            <p><strong>Security Score:</strong> ${this.detailedData.securityScore || 'N/A'}</p>
          </div>
          
          ${this.detailedData.sentences ? `
            <div class="gowinston-analysis-section">
              <h3>Sentence Analysis</h3>
              <div class="gowinston-sentences">
                ${this.detailedData.sentences.map((sentence, index) => `
                  <div class="gowinston-sentence ${sentence.aiProbability > 0.7 ? 'high-ai' : sentence.aiProbability > 0.3 ? 'medium-ai' : 'low-ai'}">
                    <span class="sentence-text">${sentence.text}</span>
                    <span class="sentence-score">${Math.round(sentence.aiProbability * 100)}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    modal.querySelector('#close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// Initialize the analyzer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GoWinstonAnalyzer();
  });
} else {
  new GoWinstonAnalyzer();
}