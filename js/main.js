// --- Clock ---
const clockElement = document.getElementById("clock");

function updateClock() {
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElement.textContent = `it's ${hours}:${minutes}:${seconds} now!`;
  }
}

if (clockElement) {
  setInterval(updateClock, 1000);
  updateClock();
}

// --- Theme ---
const themeToggleButton = document.getElementById("theme-toggle");
const body = document.body;

function applyTheme(theme) {
  function setTheme(theme) {
    if (theme === "dark-mode") {
      body.classList.add("dark-mode");
      themeToggleButton.textContent = "☀️"; // Sun emoji for dark mode
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      themeToggleButton.textContent = "🌙"; // Moon emoji for light mode
      localStorage.setItem("theme", "light-mode");
    }
    // Re-render color settings to match the new theme
    setupColorSettings();
  }

  setTheme(theme);
}

function initializeTheme() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    applyTheme(storedTheme);
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark ? "dark-mode" : "light-mode");
  }

  themeToggleButton.addEventListener("click", () => {
    if (body.classList.contains("dark-mode")) {
      applyTheme("light-mode");
    } else {
      applyTheme("dark-mode");
    }
  });
}

// --- Settings ---
let config = {
  searchEngines: {
    "!yt": "https://www.youtube.com/results?search_query=",
    "!so": "https://stackoverflow.com/search?q=",
    "!aw": "https://wiki.archlinux.org/index.php?search=",
    "!ddg": "https://duckduckgo.com/?q=",
    "!wiki": "https://en.wikipedia.org/w/index.php?search=",
    "!g": "https://www.google.com/search?q=",
    "!gh": "https://github.com/search?q=",
    "!tw": "https://twitter.com/search?q=",
    "!": "https://",
  },
  defaultSearchEngine: "https://www.google.com/search?q=",
  colors: {
    accent: null,
    clock: null,
  },
};

function loadConfig() {
  const storedConfig = localStorage.getItem("config");
  if (storedConfig) {
    config = { ...config, ...JSON.parse(storedConfig) };
  }
  // Ensure nested objects exist
  config.searchEngines = config.searchEngines || {};
  config.colors = config.colors || { accent: null, clock: null };
}

function saveConfig() {
  localStorage.setItem("config", JSON.stringify(config));
}

function applyCustomColors() {
  if (config.colors.accent) {
    document.documentElement.style.setProperty(
      "--accent-color",
      config.colors.accent
    );
  }
  if (config.colors.clock) {
    document.documentElement.style.setProperty(
      "--clock-color",
      config.colors.clock
    );
  }
}

// --- Search ---
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

function handleSearch(event) {
  event.preventDefault();
  const rawQuery = searchInput.value.trim();
  if (!rawQuery) return;

  const parts = rawQuery.split(" ");
  const prefix = parts[0];

  let searchUrl = config.defaultSearchEngine;
  let query = rawQuery;

  if (config.searchEngines[prefix]) {
    searchUrl = config.searchEngines[prefix];
    query = parts.slice(1).join(" ");
  }

  if (prefix === "!" && searchUrl === "https://") {
    window.location.href = query.startsWith("http")
      ? query
      : `https://${query}`;
    return;
  }

  window.location.href = `${searchUrl}${encodeURIComponent(query)}`;
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", handleSearch);
}

// --- Settings Modal ---
const settingsModal = document.getElementById("settings-modal");
const settingsToggle = document.getElementById("settings-toggle");
const settingsClose = document.getElementById("settings-close");
const addEngineButton = document.getElementById("add-search-engine");
const engineListDiv = document.getElementById("search-engine-list");

function populateSearchEngineSettings() {
  engineListDiv.innerHTML = "";
  for (const prefix in config.searchEngines) {
    addSearchEngineInput(prefix, config.searchEngines[prefix]);
  }
}

function addSearchEngineInput(prefix = "", url = "") {
  const entryDiv = document.createElement("div");
  entryDiv.className = "search-engine-entry";
  entryDiv.innerHTML = `
    <input type="text" value="${prefix}" placeholder="!prefix" class="engine-prefix">
    <input type="text" value="${url}" placeholder="https://search.com?q=" class="engine-url" style="flex-grow: 1;">
    <button class="remove-engine-button">Remove</button>
  `;
  engineListDiv.appendChild(entryDiv);

  entryDiv
    .querySelector(".remove-engine-button")
    .addEventListener("click", () => {
      entryDiv.remove();
      saveSearchEngineSettings();
    });
}

function saveSearchEngineSettings() {
  const newEngines = {};
  const entries = engineListDiv.querySelectorAll(".search-engine-entry");
  entries.forEach((entry) => {
    const prefix = entry.querySelector(".engine-prefix").value.trim();
    const url = entry.querySelector(".engine-url").value.trim();
    if (prefix && url) {
      newEngines[prefix] = url;
    }
  });
  config.searchEngines = newEngines;
  saveConfig();
}

function setupSettingsModal() {
  if (!settingsModal || !settingsToggle || !settingsClose) return;

  settingsToggle.addEventListener("click", () => {
    populateSearchEngineSettings();
    settingsModal.style.display = "block";
  });

  settingsClose.addEventListener("click", () => {
    saveSearchEngineSettings();
    settingsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      saveSearchEngineSettings();
      settingsModal.style.display = "none";
    }
  });

  addEngineButton.addEventListener("click", () => addSearchEngineInput());
}

function setupColorSettings() {
  const colorSettingsContainer = document.getElementById(
    "color-settings-container"
  );
  if (!colorSettingsContainer) return;

  colorSettingsContainer.innerHTML = ""; // Clear existing swatches

  const catppuccinColors = [
    "rosewater",
    "flamingo",
    "pink",
    "mauve",
    "red",
    "maroon",
    "peach",
    "yellow",
    "green",
    "teal",
    "sky",
    "sapphire",
    "blue",
    "lavender",
  ];

  const createColorPicker = (label, property) => {
    const pickerDiv = document.createElement("div");
    pickerDiv.innerHTML = `<h4>${label}</h4>`;
    const swatches = document.createElement("div");
    swatches.className = "color-swatches";

    catppuccinColors.forEach((color) => {
      const swatch = document.createElement("span");
      swatch.className = "color-swatch";
      const colorVar = body.classList.contains("dark-mode")
        ? `var(--ctp-mocha-${color})`
        : `var(--ctp-latte-${color})`;
      swatch.style.backgroundColor = colorVar;
      swatch.dataset.colorVar = colorVar;

      swatch.addEventListener("click", () => {
        config.colors[property] = colorVar;
        saveConfig();
        applyCustomColors();
      });
      swatches.appendChild(swatch);
    });
    pickerDiv.appendChild(swatches);
    return pickerDiv;
  };

  colorSettingsContainer.appendChild(
    createColorPicker("Accent Color", "accent")
  );
  colorSettingsContainer.appendChild(createColorPicker("Clock Color", "clock"));
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadConfig();
  initializeTheme();
  applyCustomColors();
  setupSettingsModal();
  setupColorSettings(); // This will need to be smarter about themes
});
