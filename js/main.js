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
    // and re-apply custom colors for the new theme.
    applyCustomColors();
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
const defaultConfig = {
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
  styles: {
    clockFontSize: "2.5", // rem
    searchFontSize: "1", // rem
    searchWidth: "50", // vw
  },
};

let config = JSON.parse(JSON.stringify(defaultConfig)); // Start with a deep copy of defaults

function loadConfig() {
  const storedConfig = localStorage.getItem("config");
  if (storedConfig) {
    const loadedConfig = JSON.parse(storedConfig);
    // Deep merge for nested objects to preserve defaults for new keys
    config = {
      ...config,
      ...loadedConfig, // User's settings override defaults
      colors: { ...config.colors, ...(loadedConfig.colors || {}) }, // Merge colors
      styles: { ...config.styles, ...(loadedConfig.styles || {}) }, // Merge styles
    };
  }
  // Ensure nested objects exist
  config.searchEngines = config.searchEngines || {};
}

function saveConfig() {
  localStorage.setItem("config", JSON.stringify(config));
}

function applyCustomColors() {
  const themePrefix = body.classList.contains("dark-mode") ? "mocha" : "latte";

  if (config.colors.accent) {
    const accentColorVar = `var(--ctp-${themePrefix}-${config.colors.accent})`;
    document.documentElement.style.setProperty(
      "--accent-color",
      accentColorVar
    );
  }
  if (config.colors.clock) {
    const clockColorVar = `var(--ctp-${themePrefix}-${config.colors.clock})`;
    document.documentElement.style.setProperty("--clock-color", clockColorVar);
  }
}

function applyCustomStyles() {
  if (config.styles.clockFontSize) {
    document.documentElement.style.setProperty(
      "--clock-font-size",
      `${config.styles.clockFontSize}rem`
    );
  }
  if (config.styles.searchFontSize) {
    document.documentElement.style.setProperty(
      "--search-font-size",
      `${config.styles.searchFontSize}rem`
    );
  }
  if (config.styles.searchWidth) {
    document.documentElement.style.setProperty(
      "--search-width",
      `${config.styles.searchWidth}vw`
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
  setupAppearanceSettings(); // Populate sliders immediately

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

  const resetSettingsButton = document.getElementById("reset-settings-button");
  if (resetSettingsButton) {
    resetSettingsButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to reset all settings to default? This cannot be undone."
        )
      ) {
        localStorage.removeItem("config");
        window.location.reload();
      }
    });
  }
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
      swatch.dataset.colorName = color;

      swatch.addEventListener("click", (event) => {
        const clickedSwatch = event.currentTarget;
        // Store the color name (e.g., 'red') instead of the full CSS variable
        config.colors[property] = clickedSwatch.dataset.colorName;
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

function setupAppearanceSettings() {
  const container = document.getElementById("appearance-settings-container");
  if (!container) return;

  container.innerHTML = ""; // Clear existing

  const createSlider = (label, property, min, max, step, unit) => {
    const settingDiv = document.createElement("div");
    settingDiv.className = "appearance-setting";

    const labelEl = document.createElement("label");
    const valueSpan = document.createElement("span");
    labelEl.textContent = `${label}: `;
    labelEl.appendChild(valueSpan);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = config.styles[property];

    const updateValue = (value) => {
      valueSpan.textContent = `${value}${unit}`;
    };

    slider.addEventListener("input", (event) => {
      const newValue = event.target.value;
      config.styles[property] = newValue;
      updateValue(newValue);
      applyCustomStyles(); // Apply live
    });

    slider.addEventListener("change", () => {
      saveConfig(); // Save only when user releases the slider
    });

    settingDiv.appendChild(labelEl);
    settingDiv.appendChild(slider);
    container.appendChild(settingDiv);

    updateValue(slider.value); // Set initial value text
  };

  createSlider("Clock Font Size", "clockFontSize", 1, 8, 0.1, "rem");
  createSlider("Search Font Size", "searchFontSize", 0.5, 2, 0.05, "rem");
  createSlider("Search Bar Width", "searchWidth", 20, 100, 1, "vw");
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadConfig();
  initializeTheme();
  applyCustomColors();
  applyCustomStyles();
  setupSettingsModal();
  setupColorSettings();
});
