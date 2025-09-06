//! ----------------------------------------------------------------
//! --- Element & State Caching ------------------------------------
//! ----------------------------------------------------------------

// Cache frequently accessed DOM elements to avoid repeated lookups.
const doc = document;
const docEl = doc.documentElement;
const body = doc.body;

// Main UI Elements
const greetingElement = doc.getElementById("greeting");
const clockElement = doc.getElementById("clock");
const searchForm = doc.getElementById("search-form");
const searchInput = doc.getElementById("search-input");

// Footer & Toggles
const themeToggleButton = doc.getElementById("theme-toggle");
const settingsToggle = doc.getElementById("settings-toggle");

// Settings Modal Elements
const settingsModal = doc.getElementById("settings-modal");
const settingsClose = doc.getElementById("settings-close");
const addEngineButton = doc.getElementById("add-search-engine");
const engineListDiv = doc.getElementById("search-engine-list");
const colorSettingsContainer = doc.getElementById("color-settings-container");
const appearanceSettingsContainer = doc.getElementById("appearance-settings-container");
const layoutSettingsContainer = doc.getElementById("layout-settings-container");

//! ----------------------------------------------------------------
//! --- Greeting & Clock -------------------------------------------
//! ----------------------------------------------------------------

function updateGreeting() {
  if (greetingElement) {
    const config = ConfigManager.get();
    greetingElement.textContent = config.styles.greetingText || "";
  }
}

function updateClock() {
  if (clockElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const format = ConfigManager.get().styles.clockFormat;
    const formattedTime = format
      .replace("{HH}", hours)
      .replace("{mm}", minutes)
      .replace("{ss}", seconds);
    clockElement.textContent = formattedTime;
  }
}

//! ----------------------------------------------------------------
//! --- Theme Management -------------------------------------------
//! ----------------------------------------------------------------

function applyTheme(newTheme) {
  const isDarkMode = newTheme === "dark-mode";
  docEl.classList.toggle("dark-mode", isDarkMode);
  themeToggleButton.textContent = isDarkMode ? "☀️" : "🌙";
  localStorage.setItem("theme", newTheme);

  // Re-apply custom colors to match the new theme's palette.
  applyCustomColors();

  // If the settings modal is open, we need to rebuild the color swatches
  // because their underlying CSS variables have changed.
  if (settingsModal.classList.contains("show")) setupColorSettings();
}

function initializeTheme() {
  const storedTheme = localStorage.getItem("theme");
  const currentTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark-mode"
      : "light-mode");

  // Set initial theme class and button icon on load.
  docEl.classList.toggle("dark-mode", currentTheme === "dark-mode");
  themeToggleButton.textContent = currentTheme === "dark-mode" ? "☀️" : "🌙";

  // Add click listener to the theme toggle button.
  themeToggleButton.addEventListener("click", () => {
    const newTheme = docEl.classList.contains("dark-mode")
      ? "light-mode"
      : "dark-mode";
    applyTheme(newTheme);
  });
}

//! ----------------------------------------------------------------
//! --- Style & Layout Application ---------------------------------
//! ----------------------------------------------------------------

function applyCustomColors() {
  const themePrefix = docEl.classList.contains("dark-mode")
    ? "mocha"
    : "latte";
  const config = ConfigManager.get();

  if (config.colors.accent) {
    const accentColorVar = `var(--ctp-${themePrefix}-${config.colors.accent})`;
    docEl.style.setProperty("--accent-color", accentColorVar);
  }
  if (config.colors.clock) {
    const clockColorVar = `var(--ctp-${themePrefix}-${config.colors.clock})`;
    docEl.style.setProperty("--clock-color", clockColorVar);
  }
  if (config.colors.greeting) {
    const greetingColorVar = `var(--ctp-${themePrefix}-${config.colors.greeting})`;
    docEl.style.setProperty("--greeting-color", greetingColorVar);
  }
}

function applyCustomStyles() {
  const config = ConfigManager.get();
  if (config.styles.clockFontSize) {
    docEl.style.setProperty(
      "--clock-font-size",
      config.styles.clockFontSize
    );
  }
  if (config.styles.greetingFontSize) {
    docEl.style.setProperty(
      "--greeting-font-size",
      config.styles.greetingFontSize
    );
  }
  if (config.styles.searchFontSize) {
    docEl.style.setProperty(
      "--search-font-size",
      config.styles.searchFontSize
    );
  }
  if (config.styles.searchWidth) {
    docEl.style.setProperty("--search-width", config.styles.searchWidth);
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
      textAlign: "center", // Default alignment for positionable elements
    });

    const [vertical, horizontal] = pos.anchor.split("-");

    // Vertical alignment
    if (vertical === "top") {
      element.style.top = pos.y;
    } else if (vertical === "bottom") {
      element.style.bottom = pos.y;
    } else {
      // center
      element.style.top = `calc(50% + ${pos.y})`;
    }

    // Horizontal alignment
    if (horizontal === "left") {
      element.style.left = pos.x;
      element.style.textAlign = "left";
    } else if (horizontal === "right") {
      element.style.right = pos.x;
      element.style.textAlign = "right";
    } else {
      // center
      element.style.left = `calc(50% + ${pos.x})`;
    }

    // Centering transform
    const horizontalAnchor = horizontal || vertical; // Handles "center" where horizontal is undefined.
    const translateX = horizontalAnchor === "center" ? "-50%" : "0";
    const translateY = vertical === "center" ? "-50%" : "0";
    element.style.transform = `translate(${translateX}, ${translateY})`;
  };

  setPosition(clockElement, clockPos);
  setPosition(searchForm, searchPos);
  setPosition(greetingElement, greetingPos);
}

//! ----------------------------------------------------------------
//! --- Search Functionality ---------------------------------------
//! ----------------------------------------------------------------

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

  // Special handler for the "!" prefix to navigate to a raw URL.
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

//! ----------------------------------------------------------------
//! --- Settings Modal: Search Engines -----------------------------
//! ----------------------------------------------------------------

function populateSearchEngineSettings() {
  engineListDiv.innerHTML = "";
  const config = ConfigManager.get();
  for (const prefix in config.searchEngines) {
    addSearchEngineInput(prefix, config.searchEngines[prefix]);
  }
}

function addSearchEngineInput(prefix = "", url = "") {
  const entryDiv = doc.createElement("div");
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

//! ----------------------------------------------------------------
//! --- Settings Modal: Main Logic & Events ------------------------
//! ----------------------------------------------------------------

// State to track if dynamic settings have been built to prevent re-creation.
let areSettingsInitialized = false;

function setupSettingsModal() {
  if (!settingsModal || !settingsToggle || !settingsClose) return;

  const toggleSettings = () => {
    const modalContent = settingsModal.querySelector(".modal-content");
    if (settingsModal.classList.contains("show")) {
      // --- Actions on Closing ---
      saveSearchEngineSettings();
      settingsModal.classList.remove("show");
      modalContent.style.transform = "scale(0.95)";
    } else {
      // --- Actions on Opening ---
      populateSearchEngineSettings();
      setupColorSettings();
      // Only build the complex settings UI once for performance.
      if (!areSettingsInitialized) {
        buildDynamicSettings();
      }
      settingsModal.classList.add("show");
      modalContent.style.transform = "scale(1)";
    }
  };

  settingsToggle.addEventListener("click", toggleSettings);
  settingsClose.addEventListener("click", toggleSettings);
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      toggleSettings();
    }
  });

  addEngineButton.addEventListener("click", () => addSearchEngineInput());

  // --- Import/Export/Reset Event Listeners ---
  const exportButton = doc.getElementById("export-settings-button");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const config = ConfigManager.get();
      const configJson = JSON.stringify(config, null, 2);
      const blob = new Blob([configJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = doc.createElement("a");
      a.href = url;
      a.download = "config.json";
      body.appendChild(a);
      a.click();
      body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  const importButton = doc.getElementById("import-settings-button");
  if (importButton) {
    importButton.addEventListener("click", () => {
      const input = doc.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target.result);
            // Basic validation: check if a known key exists.
            if (importedConfig && importedConfig.styles) {
              localStorage.setItem("config", JSON.stringify(importedConfig));
              alert(
                "Configuration imported successfully! The page will now reload."
              );
              window.location.reload();
            } else {
              throw new Error("Invalid config file format.");
            }
          } catch (error) {
            alert(`Error importing configuration: ${error.message}`);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  const resetSettingsButton = doc.getElementById("reset-settings-button");
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

  // --- Global Keybinds ---
  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey) {
      if (event.key === ",") {
        event.preventDefault();
        toggleSettings();
      } else if (event.key === ".") {
        event.preventDefault(); // Prevent browser's default action.
        const newTheme = docEl.classList.contains("dark-mode")
          ? "light-mode"
          : "dark-mode";
        applyTheme(newTheme);
      }
    }
  });
}

//! ----------------------------------------------------------------
//! --- Settings Modal: Color Pickers ------------------------------
//! ----------------------------------------------------------------

function setupColorSettings() {
  if (!colorSettingsContainer) return;

  colorSettingsContainer.innerHTML = ""; // Always rebuild as colors depend on theme.

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
    const pickerDiv = doc.createElement("div");
    pickerDiv.innerHTML = `<h4>${label}</h4>`;
    const swatches = doc.createElement("div");
    swatches.className = "color-swatches";

    catppuccinColors.forEach((color) => {
      const swatch = doc.createElement("span");
      swatch.className = "color-swatch";
      const colorVar = docEl.classList.contains("dark-mode")
        ? `var(--ctp-mocha-${color})`
        : `var(--ctp-latte-${color})`;
      swatch.style.backgroundColor = colorVar;
      swatch.dataset.colorName = color;

      // Highlight the currently selected color.
      if (ConfigManager.get().colors[property] === color) {
        swatch.classList.add("selected");
      }

      // Event listener to handle color selection.
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
        // Store the color name (e.g., 'red'), not the CSS variable.
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

//! ----------------------------------------------------------------
//! --- Settings Modal: Dynamic UI Builders ------------------------
//! ----------------------------------------------------------------

/**
 * Builds the Appearance and Layout settings sections.
 * This is called only once to improve performance when opening the modal.
 */
function buildDynamicSettings() {
  // The containers are now the direct children for the new sections.
  if (
    !appearanceSettingsContainer ||
    !layoutSettingsContainer ||
    !settingsModal
  )
    return;

  // Create dedicated sections for each major component.
  setupGreetingSettings();
  setupClockSettings();
  setupSearchSettings();

  areSettingsInitialized = true;
}

function createSettingsGroup(container, title) {
  const fieldset = doc.createElement("fieldset");
  fieldset.className = "settings-group";
  const legend = doc.createElement("legend");
  legend.textContent = title;
  fieldset.appendChild(legend);
  container.appendChild(fieldset);
  return fieldset;
}

/**
 * Creates and populates the settings UI for a given component.
 * This function is a generalized helper to avoid repeating code.
 * @param {string} title - The title for the settings section (e.g., "Greeting").
 * @param {Function[]} controls - An array of functions that each return a setting control element.
 */
function createComponentSettings(title, controls) {
  const section = doc.createElement("div");
  section.className = "settings-section";

  // --- Create and append the new section ---
  section.innerHTML = `<h3>${title}</h3>`;
  const fieldset = createSettingsGroup(section, "Settings");
  controls.forEach((controlFn) => fieldset.appendChild(controlFn()));

  // Find the 'Danger Zone' section to insert our new sections before it.
  const dangerZone = settingsModal.querySelector(".settings-section.danger-zone");
  if (dangerZone) {
    dangerZone.parentElement.insertBefore(section, dangerZone);
  } else {
    // Fallback if danger zone isn't found
    settingsModal.querySelector(".modal-content").appendChild(section);
  }

  // Clear the old containers
  appearanceSettingsContainer.remove();
  layoutSettingsContainer.remove();
}

const createTextInput = (label, property, placeholder, description) => {
  const containerDiv = doc.createElement("div");
  containerDiv.className = "appearance-setting";
  const id = `setting-${property}`;

  const labelEl = doc.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  const input = doc.createElement("input");
  input.type = "text";
  input.className = "appearance-input";
  input.value = ConfigManager.get().styles[property];
  input.id = id;
  input.placeholder = placeholder;

  // Live update for instant feedback.
  input.addEventListener("input", (event) => {
    const value = event.target.value;
    ConfigManager.get().styles[property] = value;
    if (property === "clockFormat") {
      updateClock();
    } else if (property === "greetingText") {
      updateGreeting();
    } else if (
      ["greetingFontSize", "clockFontSize", "searchFontSize", "searchWidth"].includes(
        property
      )
    ) {
      applyCustomStyles();
    }
  });

  input.addEventListener("change", () => ConfigManager.save()); // Save on blur.

  const settingDiv = doc.createElement("div");
  settingDiv.className = "setting-control";
  settingDiv.appendChild(input);

  containerDiv.appendChild(labelEl);
  containerDiv.appendChild(settingDiv);
  return containerDiv;
};

const createUnitInput = (label, property, units, placeholder) => {
  const containerDiv = doc.createElement("div");
  containerDiv.className = "appearance-setting";

  const labelEl = doc.createElement("label");
  labelEl.textContent = label;

  const controlContainer = doc.createElement("div");
  controlContainer.className = "setting-control";

  const currentCombinedValue = ConfigManager.get().styles[property] || `0${units[0]}`;
  const match = currentCombinedValue.match(/(-?\d*\.?\d+)(\D+)?/);
  let currentValue = "0";
  let currentUnit = units[0];

  if (match) {
    currentValue = match[1] || "0";
    currentUnit = match[2] || units[0];
  }

  const wrapper = doc.createElement("div");
  wrapper.className = "offset-control"; // Re-use the same styling

  const valueInput = doc.createElement("input");
  valueInput.type = "number";
  valueInput.className = "appearance-input offset-value";
  valueInput.value = currentValue;
  valueInput.placeholder = placeholder || "value";

  const unitSelect = doc.createElement("select");
  unitSelect.className = "appearance-input offset-unit";
  units.forEach((unit) => {
    const option = doc.createElement("option");
    option.value = unit;
    option.textContent = unit;
    if (unit === currentUnit) {
      option.selected = true;
    }
    unitSelect.appendChild(option);
  });

  const updateStyle = () => {
    const newValue = valueInput.value || "0";
    const newUnit = unitSelect.value;
    ConfigManager.get().styles[property] = `${newValue}${newUnit}`;
    applyCustomStyles();
  };

  const saveStyle = () => {
    updateStyle();
    ConfigManager.save();
  };

  valueInput.addEventListener("input", updateStyle);
  valueInput.addEventListener("change", saveStyle);
  unitSelect.addEventListener("change", saveStyle);

  wrapper.appendChild(valueInput);
  wrapper.appendChild(unitSelect);
  controlContainer.appendChild(wrapper);
  containerDiv.appendChild(labelEl);
  containerDiv.appendChild(controlContainer);
  return containerDiv;
};

const createCheckbox = (label, property) => {
  const containerDiv = doc.createElement("div");
  containerDiv.className = "appearance-setting";
  const id = `setting-${property}`;

  const labelEl = doc.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  const checkbox = doc.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = id;
  checkbox.className = "appearance-checkbox";
  checkbox.checked = ConfigManager.get().styles[property];

  // Update and save config when checkbox state changes.
  checkbox.addEventListener("change", (event) => {
    ConfigManager.get().styles[property] = event.target.checked;
    ConfigManager.save();
    applyCustomStyles();
  });

  const settingDiv = doc.createElement("div");
  settingDiv.className = "setting-control";
  settingDiv.appendChild(checkbox);

  containerDiv.appendChild(labelEl);
  containerDiv.appendChild(settingDiv);
  return containerDiv;
};

const createAnchorControl = (label, element) => {
  const containerDiv = doc.createElement("div");
  containerDiv.className = "appearance-setting";
  const id = `setting-pos-${element}`; // Use the 'element' parameter for a unique ID.

  const labelEl = doc.createElement("label");
  labelEl.htmlFor = id;
  labelEl.appendChild(doc.createTextNode(label));

  const controlContainer = doc.createElement("div");
  controlContainer.className = "setting-control";

  const select = doc.createElement("select");
  const options = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];
  options.forEach((opt) => {
    const option = doc.createElement("option");
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

  // X/Y Offset Inputs
  const positionUnits = ["px", "vw", "vh", "%", "rem", "em"];
  const createOffsetControl = (axis) => {
    const currentOffset = ConfigManager.get().positions[element]?.[axis] || "0px";
    const match = currentOffset.match(/(-?\d*\.?\d+)(\D+)?/);
    let currentValue = "0";
    let currentUnit = "px";

    if (match) {
      currentValue = match[1] || "0";
      currentUnit = match[2] || "px";
    }

    const wrapper = doc.createElement("div");
    wrapper.className = "offset-control";

    const valueInput = doc.createElement("input");
    valueInput.type = "number";
    valueInput.className = "appearance-input offset-value";
    valueInput.value = currentValue;
    valueInput.placeholder = axis.toUpperCase();

    const unitSelect = doc.createElement("select");
    unitSelect.className = "appearance-input offset-unit";
    positionUnits.forEach((unit) => {
      const option = doc.createElement("option");
      option.value = unit;
      option.textContent = unit;
      if (unit === currentUnit) {
        option.selected = true;
      }
      unitSelect.appendChild(option);
    });

    const updatePosition = () => {
      const newValue = valueInput.value || "0";
      const newUnit = unitSelect.value;
      ConfigManager.get().positions[element][axis] = `${newValue}${newUnit}`;
      applyCustomPositions();
    };

    const savePosition = () => {
      updatePosition();
      ConfigManager.save();
    };

    valueInput.addEventListener("input", updatePosition);
    valueInput.addEventListener("change", savePosition);
    unitSelect.addEventListener("change", savePosition);

    wrapper.appendChild(valueInput);
    wrapper.appendChild(unitSelect);
    return wrapper;
  };

  controlContainer.appendChild(createOffsetControl("x"));
  controlContainer.appendChild(createOffsetControl("y"));

  containerDiv.appendChild(labelEl);
  containerDiv.appendChild(controlContainer);
  return containerDiv;
};

function setupGreetingSettings() {
  createComponentSettings("Greeting", [
    () => createCheckbox("Show Greeting", "showGreeting"),
    () => createTextInput("Text", "greetingText", "e.g. Hello, Homie!"),
    () =>
      createUnitInput(
        "Font Size",
        "greetingFontSize",
        ["rem", "em", "px", "pt"],
        "1.5"
      ),
    () => createAnchorControl("Position", "greeting"),
  ]);
}

function setupClockSettings() {
  createComponentSettings("Clock", [
    () => createTextInput("Format", "clockFormat", "e.g. {HH}:{mm}:{ss}"),
    () =>
      createUnitInput(
        "Font Size",
        "clockFontSize",
        ["rem", "em", "px", "pt"],
        "2.5"
      ),
    () => createAnchorControl("Position", "clock"),
  ]);
}

function setupSearchSettings() {
  createComponentSettings("Search Bar", [
    () => createUnitInput("Font Size", "searchFontSize", ["rem", "em", "px"], "1"),
    () => createUnitInput("Width", "searchWidth", ["vw", "%", "px"], "50"),
    () => createAnchorControl("Position", "search"),
  ]);

  // The footer settings don't fit neatly into the component-based sections,
  // so we'll create a separate section for them.
  const section = doc.createElement("div");
  section.className = "settings-section";
  section.innerHTML = `<h3>General</h3>`;
  const fieldset = createSettingsGroup(section, "Footer Visibility");
  fieldset.appendChild(
    createCheckbox("Show 'made by me' Credit", "showCredit")
  );
  fieldset.appendChild(
    createCheckbox("Show Settings Button (Ctrl+,)", "showSettingsButton")
  );
  fieldset.appendChild(
    createCheckbox("Show Theme Toggle Button (Ctrl+.)", "showThemeButton")
  );

  const dangerZone = settingsModal.querySelector(".settings-section.danger-zone");
  if (dangerZone) {
    dangerZone.parentElement.insertBefore(section, dangerZone);
  } else {
    settingsModal.querySelector(".modal-content").appendChild(section);
  }
}

//! ----------------------------------------------------------------
//! --- App Initialization -----------------------------------------
//! ----------------------------------------------------------------

doc.addEventListener("DOMContentLoaded", () => {
  // Load config from localStorage first.
  ConfigManager.load();

  // Set up initial state and apply all styles and positions.
  initializeTheme();
  applyCustomColors();
  applyCustomStyles(); // This also calls applyCustomPositions.
  updateGreeting();
  updateClock(); // Initial call to prevent a 1-second delay.

  // Set up all event listeners for settings, search, etc.
  setupSettingsModal();

  // Start the clock interval.
  setInterval(updateClock, 1000);
});
