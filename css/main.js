// --- Greeting ---
function updateGreeting() {
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    const config = ConfigManager.get();
    greetingElement.textContent = config.styles.greetingText || "";
  }
}

// --- Clock ---
const clockElement = document.getElementById("clock");

function updateClock() {
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const format = ConfigManager.get().styles.clockFormat || "it's {HH}:{mm}:{ss} now!";
    const formattedTime = format
      .replace("{HH}", hours)
      .replace("{mm}", minutes)
      .replace("{ss}", seconds);
    clockElement.textContent = formattedTime;
  }
}

// --- Theme ---
const themeToggleButton = document.getElementById("theme-toggle");
const body = document.body;

function applyTheme(newTheme) {
  const isDarkMode = newTheme === "dark-mode";
  document.documentElement.classList.toggle("dark-mode", isDarkMode);
  themeToggleButton.textContent = isDarkMode ? "☀️" : "🌙";
  localStorage.setItem("theme", newTheme);

  // Re-render color settings to match the new theme
  // and re-apply custom colors for the new theme.
  applyCustomColors();
  // If settings are open, refresh the color swatches
  if (settingsModal.classList.contains("show")) setupColorSettings();
}

function initializeTheme() {
  const storedTheme = localStorage.getItem("theme");
  const currentTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark-mode"
      : "light-mode");

  // Set initial state from localStorage or system preference
  document.documentElement.classList.toggle("dark-mode", currentTheme === "dark-mode");
  themeToggleButton.textContent = currentTheme === "dark-mode" ? "☀️" : "🌙";

  themeToggleButton.addEventListener("click", () => {
    const newTheme = document.documentElement.classList.contains("dark-mode")
      ? "light-mode"
      : "dark-mode";
    applyTheme(newTheme);
  });
}

// --- Settings ---

function applyCustomColors() {
  const themePrefix = document.documentElement.classList.contains("dark-mode") ? "mocha" : "latte";
  const config = ConfigManager.get();

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
  if (config.colors.greeting) {
    const greetingColorVar = `var(--ctp-${themePrefix}-${config.colors.greeting})`;
    document.documentElement.style.setProperty(
      "--greeting-color",
      greetingColorVar
    );
  }
}

function applyCustomStyles() {
  const config = ConfigManager.get();
  if (config.styles.clockFontSize) {
    document.documentElement.style.setProperty(
      "--clock-font-size",
      `${config.styles.clockFontSize}rem`
    );
  }
  if (config.styles.greetingFontSize) {
    document.documentElement.style.setProperty(
      "--greeting-font-size",
      `${config.styles.greetingFontSize}rem`
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

  const setElementVisibility = (id, isVisible) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = isVisible ? "" : "none";
    }
  };

  setElementVisibility("credit-text", config.styles.showCredit);
  setElementVisibility("settings-toggle", config.styles.showSettingsButton);
  setElementVisibility("theme-toggle", config.styles.showThemeButton);
  setElementVisibility("greeting", config.styles.showGreeting);
  applyCustomPositions();
}

function applyCustomPositions() {
  const clockEl = document.getElementById("clock");
  const searchEl = document.getElementById("search-form");
  const greetingEl = document.getElementById("greeting");
  const clockPos = ConfigManager.get().positions.clock;
  const searchPos = ConfigManager.get().positions.search;
  const greetingPos = ConfigManager.get().positions.greeting;

  const setPosition = (element, pos) => {
    if (!element || !pos || !pos.anchor) return;

    // Reset styles
    Object.assign(element.style, {
      top: "auto",
      left: "auto",
      bottom: "auto",
      right: "auto",
      transform: "translate(0, 0)",
      textAlign: "center", // Default for positionable elements
    });

    const [vertical, horizontal] = pos.anchor.split("-");

    // Vertical alignment
    if (vertical === "top") {
      element.style.top = pos.y;
    } else if (vertical === "bottom") {
      element.style.bottom = pos.y;
    } else { // center
      element.style.top = `calc(50% + ${pos.y})`;
    }

    // Horizontal alignment
    if (horizontal === "left") {
      element.style.left = pos.x;
      element.style.textAlign = "left";
    } else if (horizontal === "right") {
      element.style.right = pos.x;
      element.style.textAlign = "right";
    } else { // center
      element.style.left = `calc(50% + ${pos.x})`;
    }

    // Centering transform
    const horizontalAnchor = horizontal || vertical; // Handles "center" where horizontal is undefined
    const translateX = horizontalAnchor === "center" ? "-50%" : "0";
    const translateY = vertical === "center" ? "-50%" : "0";
    element.style.transform = `translate(${translateX}, ${translateY})`;
  };

  setPosition(clockEl, clockPos);
  setPosition(searchEl, searchPos);
  setPosition(greetingEl, greetingPos);
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

  const config = ConfigManager.get();
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
  const config = ConfigManager.get();
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
  ConfigManager.get().searchEngines = newEngines;
  ConfigManager.save();
}

function setupSettingsModal() {
  if (!settingsModal || !settingsToggle || !settingsClose) return;

  const toggleSettings = () => {
    const modalContent = settingsModal.querySelector(".modal-content");
    if (settingsModal.classList.contains("show")) {
      // Closing
      saveSearchEngineSettings();
      settingsModal.classList.remove("show");
      modalContent.style.transform = "scale(0.95)";
    } else {
      // Opening
      populateSearchEngineSettings();
      setupColorSettings();
      setupAppearanceSettings();
      setupLayoutSettings();
      settingsModal.classList.add("show");
      modalContent.style.transform = "scale(1)";
    }
  };

  settingsToggle.addEventListener("click", toggleSettings);
  settingsClose.addEventListener("click", toggleSettings);
  settingsModal.addEventListener("click", (event) => { if (event.target === settingsModal) { toggleSettings(); } });

  addEngineButton.addEventListener("click", () => addSearchEngineInput());

  // --- Import/Export ---
  const exportButton = document.getElementById("export-settings-button");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const config = ConfigManager.get();
      const configJson = JSON.stringify(config, null, 2); // Pretty-print JSON
      const blob = new Blob([configJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "config.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  const importButton = document.getElementById("import-settings-button");
  if (importButton) {
    importButton.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target.result);
            // Simple validation: check if a known key exists
            if (importedConfig && importedConfig.styles) {
              localStorage.setItem("config", JSON.stringify(importedConfig));
              alert("Configuration imported successfully! The page will now reload.");
              window.location.reload();
            } else { throw new Error("Invalid config file format."); }
          } catch (error) { alert(`Error importing configuration: ${error.message}`); }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  const resetSettingsButton = document.getElementById("reset-settings-button");
  if (resetSettingsButton) {
    resetSettingsButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to reset all settings to default? This cannot be undone."
        )
      ) {
        ConfigManager.reset();
        window.location.reload();
      }
    });
  }

  // Add keybinds
  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey) {
      if (event.key === ",") {
        event.preventDefault();
        toggleSettings();
      } else if (event.key === ".") {
        event.preventDefault();
        const newTheme = document.documentElement.classList.contains("dark-mode")
          ? "light-mode"
          : "dark-mode";
        applyTheme(newTheme);
      }
    }
  });
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
      const colorVar = document.documentElement.classList.contains("dark-mode")
        ? `var(--ctp-mocha-${color})`
        : `var(--ctp-latte-${color})`;
      swatch.style.backgroundColor = colorVar;
      swatch.dataset.colorName = color;

      // Highlight the selected color on creation
      if (ConfigManager.get().colors[property] === color) {
        swatch.classList.add("selected");
      }

      swatch.addEventListener("click", (event) => {
        const clickedSwatch = event.currentTarget;
        // Remove 'selected' from any previously selected swatch in this group
        const parentSwatches = clickedSwatch.parentElement;
        const oldSelected = parentSwatches.querySelector(".selected");
        if (oldSelected) {
          oldSelected.classList.remove("selected");
        }
        // Add 'selected' to the newly clicked swatch
        clickedSwatch.classList.add("selected");
        // Store the color name (e.g., 'red') instead of the full CSS variable
        ConfigManager.get().colors[property] = clickedSwatch.dataset.colorName;
        ConfigManager.save();
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
  colorSettingsContainer.appendChild(
    createColorPicker("Greeting Color", "greeting")
  );
  colorSettingsContainer.appendChild(createColorPicker("Clock Color", "clock"));
}

function createSettingsGroup(container, title) {
  const fieldset = document.createElement("fieldset");
  fieldset.className = "settings-group";
  const legend = document.createElement("legend");
  legend.textContent = title;
  fieldset.appendChild(legend);
  container.appendChild(fieldset);
  return fieldset;
}

function setupAppearanceSettings() {
  const container = document.getElementById("appearance-settings-container");
  if (!container) return;

  container.innerHTML = ""; // Clear existing

  const createTextInput = (label, property, placeholder, description) => {
    const labelEl = document.createElement("label");
    labelEl.className = "appearance-setting";
    const id = `setting-${property}`;
    labelEl.htmlFor = id;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "appearance-input";
    input.value = ConfigManager.get().styles[property];
    input.id = id;
    input.placeholder = placeholder;

    input.addEventListener("input", (event) => { // Live update
      ConfigManager.get().styles[property] = event.target.value;
      if (property === 'clockFormat') updateClock(); else if (property === 'greetingText') updateGreeting();
    });

    input.addEventListener("change", () => { // Save on blur
      ConfigManager.save();
    });

    labelEl.appendChild(document.createTextNode(label));
    const settingDiv = document.createElement("div");
    settingDiv.className = "setting-control";
    settingDiv.appendChild(input);
    labelEl.appendChild(settingDiv);
    return labelEl;
  };

  const createSlider = (label, property, min, max, step, unit) => {
    const labelEl = document.createElement("label");
    labelEl.className = "appearance-setting";
    const valueSpan = document.createElement("span");
    const id = `setting-${property}`;
    labelEl.htmlFor = id;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.className = "appearance-slider";
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = ConfigManager.get().styles[property];

    const updateValue = (value) => {
      valueSpan.textContent = `${value}${unit}`;
    };

    slider.addEventListener("input", (event) => {
      const newValue = event.target.value;
      ConfigManager.get().styles[property] = newValue;
      updateValue(newValue);
      applyCustomStyles(); // Apply live
    });

    slider.addEventListener("change", () => {
      ConfigManager.save(); // Save only when user releases the slider
    });

    labelEl.appendChild(document.createTextNode(`${label}: `));
    labelEl.appendChild(valueSpan);
    const settingDiv = document.createElement("div");
    settingDiv.className = "setting-control";
    settingDiv.appendChild(slider);
    labelEl.appendChild(settingDiv);

    updateValue(slider.value); // Set initial value text
    return labelEl;
  };
  
  const createCheckbox = (label, property) => {
    const labelEl = document.createElement("label");
    labelEl.className = "appearance-setting";
    const id = `setting-${property}`;
    labelEl.htmlFor = id;
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.className = "appearance-checkbox";
    checkbox.checked = ConfigManager.get().styles[property];

    checkbox.addEventListener("change", (event) => {
      ConfigManager.get().styles[property] = event.target.checked;
      ConfigManager.save();
      applyCustomStyles(); // Re-apply styles to show/hide credit
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = label;
    labelEl.appendChild(textSpan);

    const settingDiv = document.createElement("div");
    settingDiv.className = "setting-control";
    settingDiv.appendChild(checkbox);
    labelEl.appendChild(settingDiv);
    return labelEl;
  };

  // --- Create Groups ---
  const greetingGroup = createSettingsGroup(container, "Greeting");
  greetingGroup.appendChild(createCheckbox("Show Greeting", "showGreeting"));
  greetingGroup.appendChild(createTextInput("Text", "greetingText", "e.g. Hello, Homie!"));
  greetingGroup.appendChild(createSlider("Font Size", "greetingFontSize", 0.5, 5, 0.1, "rem"));

  const clockGroup = createSettingsGroup(container, "Clock");
  clockGroup.appendChild(createTextInput("Format", "clockFormat", "e.g. {HH}:{mm}"));
  clockGroup.appendChild(createSlider("Font Size", "clockFontSize", 1, 8, 0.1, "rem"));

  const searchGroup = createSettingsGroup(container, "Search Bar");  
  searchGroup.appendChild(createSlider("Font Size", "searchFontSize", 0.5, 2, 0.05, "rem"));
  searchGroup.appendChild(createSlider("Width", "searchWidth", 20, 95, 1, "vw"));

  const generalGroup = createSettingsGroup(container, "Footer");
  generalGroup.appendChild(createCheckbox("Show 'made by me' Credit", "showCredit"));
  generalGroup.appendChild(createCheckbox("Show Settings Button (Ctrl+,)", "showSettingsButton"));
  generalGroup.appendChild(createCheckbox("Show Theme Toggle Button (Ctrl+.)", "showThemeButton"));
}

function setupLayoutSettings() {
  const container = document.getElementById("layout-settings-container");
  if (!container) return;

  container.innerHTML = ""; // Clear existing
  
  const createAnchorControl = (label, element) => {
    const labelEl = document.createElement("label");
    labelEl.className = "appearance-setting";
    const id = `setting-pos-${element}`;
    labelEl.htmlFor = id;
    labelEl.appendChild(document.createTextNode(label));

    const controlContainer = document.createElement('div');
    controlContainer.style.display = 'flex';
    controlContainer.style.gap = '10px';
    controlContainer.style.alignItems = 'center';

    // Anchor Select
    const select = document.createElement("select");
    const options = ["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"];
    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      select.appendChild(option);
    });
    select.id = id;
    select.value = ConfigManager.get().positions[element]?.anchor || "center";
    select.addEventListener("change", (event) => {
      ConfigManager.get().positions[element].anchor = event.target.value;
      applyCustomPositions();
      ConfigManager.save();
    });
    controlContainer.appendChild(select);

    // X/Y Inputs
    ['x', 'y'].forEach(axis => {
        const posInput = document.createElement('input');
        posInput.type = 'text';
        posInput.className = 'appearance-input';
        posInput.style.width = '80px';
        posInput.placeholder = `${axis.toUpperCase()} offset (e.g. 5vw)`;
        posInput.value = ConfigManager.get().positions[element]?.[axis] || "0vw";

        posInput.addEventListener('input', (event) => {
            ConfigManager.get().positions[element][axis] = event.target.value;
            applyCustomPositions();
        });
        posInput.addEventListener('change', () => {
            ConfigManager.save();
        });
        controlContainer.appendChild(posInput);
    });

    labelEl.appendChild(controlContainer);
    return labelEl;
  };

  const greetingGroup = createSettingsGroup(container, "Greeting");
  greetingGroup.appendChild(createAnchorControl("Position", "greeting"));

  const clockGroup = createSettingsGroup(container, "Clock");
  clockGroup.appendChild(createAnchorControl("Position", "clock"));

  const searchGroup = createSettingsGroup(container, "Search Bar");
  searchGroup.appendChild(createAnchorControl("Position", "search"));
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  ConfigManager.load();
  initializeTheme();
  applyCustomColors();
  applyCustomStyles(); // Includes applyCustomPositions
  setupSettingsModal(); // Sets up listeners

  // Pre-render clock to avoid delay
  updateGreeting();
  updateClock();
  // Start the clock after the DOM is loaded and config is ready
  if (document.getElementById("clock")) {
    setInterval(updateClock, 1000);
  }
});
