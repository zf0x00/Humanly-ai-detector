document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const bigToggleBtn = document.getElementById("big-toggle-btn");
  const bigToggleText = document.getElementById("big-toggle-text");
  const currentDomainLabel = document.getElementById("current-domain-label");
  const addDomainInput = document.getElementById("add-domain-input");
  const addDomainBtn = document.getElementById("add-domain-btn");
  const domainListEl = document.getElementById("domain-list");
  const messageDiv = document.getElementById("message");

  let currentDomain = "";
  let allowedDomains = [];

  // Utility for domain (normalize: strip www.)
  function getDomain(url) {
    try {
      let u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  // Get current tab domain and set label
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab && tab.url) {
      currentDomain = getDomain(tab.url);
      currentDomainLabel.textContent = currentDomain
        ? "This domain: " + currentDomain
        : "Not a website tab";
      loadAllowedDomains();
    }
  });

  // Load allowed domains from storage
  function loadAllowedDomains() {
    chrome.storage.sync.get({ allowedDomains: [] }, (data) => {
      allowedDomains = data.allowedDomains || [];
      updateBigToggle();
      renderDomainList();
    });
  }

  // Update the big toggle button (on/off)
  function updateBigToggle() {
    const isActive = allowedDomains.includes(currentDomain);
    bigToggleBtn.classList.toggle("active", isActive);
    bigToggleText.textContent = isActive ? "ON" : "OFF";
  }

  // Handle big toggle click
  bigToggleBtn.onclick = function () {
    if (!currentDomain) return;
    const idx = allowedDomains.indexOf(currentDomain);
    if (idx === -1) {
      allowedDomains.push(currentDomain);
      showMessage("Activated on " + currentDomain, "success");
    } else {
      allowedDomains.splice(idx, 1);
      showMessage("Deactivated on " + currentDomain, "success");
    }
    chrome.storage.sync.set({ allowedDomains });
    updateBigToggle();
    renderDomainList();
  };

  // Add domain via input
  addDomainBtn.onclick = function () {
    const domain = addDomainInput.value.trim().replace(/^www\./, "");
    if (domain && !allowedDomains.includes(domain)) {
      allowedDomains.push(domain);
      chrome.storage.sync.set({ allowedDomains });
      addDomainInput.value = "";
      showMessage("Added: " + domain, "success");
      updateBigToggle();
      renderDomainList();
    }
  };
  addDomainInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addDomainBtn.click();
  });

  // Render domain list with remove buttons
  function renderDomainList() {
    domainListEl.innerHTML = "";
    allowedDomains.forEach(domain => {
      const li = document.createElement("li");
      li.textContent = domain;
      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.title = "Remove";
      delBtn.onclick = () => {
        allowedDomains = allowedDomains.filter(d => d !== domain);
        chrome.storage.sync.set({ allowedDomains });
        if (domain === currentDomain) updateBigToggle();
        renderDomainList();
      };
      li.appendChild(delBtn);
      domainListEl.appendChild(li);
    });
  }

  // Privacy policy link
  document.getElementById("view-privacy").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: "https://gowinston.ai/privacy" });
  });

  // Show a temporary message
  function showMessage(text, type = "success") {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = "block";
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }
});