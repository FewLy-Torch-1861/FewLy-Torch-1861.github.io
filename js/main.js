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

function applyTheme(theme) {
  function setTheme(theme) {
    if (theme === "dark-mode") {
      document.documentElement.classList.add("dark-mode");
      themeToggleButton.textContent = "☀️"; // Sun emoji for dark mode
      localStorage.setItem("theme", "dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
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
  const currentTheme =
    storedTheme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark-mode"
      : "light-mode");

  // Set the button icon based on the initially loaded theme
  if (currentTheme === "dark-mode") {
    themeToggleButton.textContent = "☀️";
  } else {
    themeToggleButton.textContent = "🌙";
  }

  themeToggleButton.addEventListener("click", () => {
    const newTheme = document.documentElement.classList.contains("dark-mode") ? "light-mode" : "dark-mode";
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
}

function applyCustomStyles() {
  const config = ConfigManager.get();
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

  const setElementVisibility = (id, isVisible) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = isVisible ? "" : "none";
    }
  };

  setElementVisibility("credit-text", config.styles.showCredit);
  setElementVisibility("settings-toggle", config.styles.showSettingsButton);
  setElementVisibility("theme-toggle", config.styles.showThemeButton);
  applyCustomPositions();
}

function applyCustomPositions() {
  const clockEl = document.getElementById("clock");
  const searchEl = document.getElementById("search-form");
  const clockPos = ConfigManager.get().positions.clock;
  const searchPos = ConfigManager.get().positions.search;

  // If both are set to be in the exact same spot (center/center), stack them.
  if (
    clockPos.v === "center" &&
    clockPos.h === "center" &&
    searchPos.v === "center" &&
    searchPos.h === "center"
  ) {
    // Create a temporary container to center them together
    let centerContainer = document.getElementById("center-container");
    if (!centerContainer) {
      centerContainer = document.createElement("div");
      centerContainer.id = "center-container";
      document.body.insertBefore(centerContainer, clockEl);
      centerContainer.appendChild(clockEl);
      centerContainer.appendChild(searchEl);
    }
    // Reset individual positioning styles
    [clockEl, searchEl].forEach((el) => {
      el.style.position = "relative";
      el.style.top = "auto";
      el.style.left = "auto";
      el.style.bottom = "auto";
      el.style.right = "auto";
      el.style.transform = "none";
    });
    return; // Stop here for this special case
  }

  const setPosition = (element, pos) => {
    if (!element || !pos) return;

    // Ensure element is a direct child of body for absolute positioning
    if (element.parentElement.id === "center-container") {
      document.body.insertBefore(element, element.parentElement);
    }

    element.style.position = "absolute";
    element.style.top = "auto";
    element.style.bottom = "auto";
    element.style.left = "auto";
    element.style.right = "auto";
    let transform = [];
    const paddingV = `${ConfigManager.get().styles.edgePaddingV}%`;
    const paddingH = `${ConfigManager.get().styles.edgePaddingH}%`;

    if (pos.v === "top") element.style.top = paddingV;
    else if (pos.v === "bottom") element.style.bottom = paddingV;
    else {
      element.style.top = "50%";
      transform.push("translateY(-50%)");
    }

    if (pos.h === "left") element.style.left = paddingH;
    else if (pos.h === "right") element.style.right = paddingH;
    else {
      element.style.left = "50%";
      transform.push("translateX(-50%)");
    }

    element.style.transform = transform.join(" ");
  };

  setPosition(clockEl, clockPos);
  setPosition(searchEl, searchPos);
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

  settingsToggle.addEventListener("click", () => {
    settingsModal.style.display = "block";
    populateSearchEngineSettings();
  });
  setupAppearanceSettings(); // Populate settings immediately
  setupLayoutSettings();

  const openSettings = () => {
    if (settingsModal.style.display === "block") {
      settingsModal.style.display = "none";
      saveSearchEngineSettings();
    } else {
      settingsModal.style.display = "block";
      populateSearchEngineSettings();
    }
  };

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
        openSettings();
      } else if (event.key === ".") {
        event.preventDefault();
        const newTheme = document.documentElement.classList.contains("dark-mode") ? "light-mode" : "dark-mode";
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

      swatch.addEventListener("click", (event) => {
        const clickedSwatch = event.currentTarget;
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
    const settingDiv = document.createElement("div");
    settingDiv.className = "appearance-setting";

    const labelEl = document.createElement("label");
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "appearance-input";
    input.value = ConfigManager.get().styles[property];
    input.placeholder = placeholder;

    input.addEventListener("input", (event) => {
      ConfigManager.get().styles[property] = event.target.value;
      updateClock(); // Update clock live as user types
    });

    input.addEventListener("change", () => {
      ConfigManager.save();
    });

    settingDiv.appendChild(labelEl);
    settingDiv.appendChild(input);
    return settingDiv;
  };

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

    settingDiv.appendChild(labelEl);
    settingDiv.appendChild(slider);

    updateValue(slider.value); // Set initial value text
    return settingDiv;
  };
  
  const createSelect = (label, element, axis) => {
    const settingDiv = document.createElement("div");
    settingDiv.className = "appearance-setting";

    const labelEl = document.createElement("label");
    labelEl.textContent = label;

    const select = document.createElement("select");
    const options =
      axis === "v" ? ["top", "center", "bottom"] : ["left", "center", "right"];

    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      select.appendChild(option);
    });

    select.value =
      ConfigManager.get().positions[element]?.[axis] || (axis === "v" ? "center" : "center");

    select.addEventListener("change", (event) => {
      ConfigManager.get().positions[element][axis] = event.target.value;
      applyCustomPositions();
      ConfigManager.save();
    });

    settingDiv.appendChild(labelEl);
    settingDiv.appendChild(select);
    return settingDiv;
  };

  const createCheckbox = (label, property) => {
    const settingDiv = document.createElement("div");
    settingDiv.className = "appearance-setting";

    const labelEl = document.createElement("label");
    labelEl.style.display = "flex";
    labelEl.style.alignItems = "center";
    labelEl.style.gap = "10px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "appearance-checkbox";
    checkbox.checked = ConfigManager.get().styles[property];

    checkbox.addEventListener("change", (event) => {
      ConfigManager.get().styles[property] = event.target.checked;
      ConfigManager.save();
      applyCustomStyles(); // Re-apply styles to show/hide credit
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = label;

    labelEl.appendChild(checkbox);
    labelEl.appendChild(textSpan);
    settingDiv.appendChild(labelEl);
    return settingDiv;
  };

  // --- Create Groups ---
  const clockGroup = createSettingsGroup(container, "Clock");
  clockGroup.appendChild(createTextInput("Format", "clockFormat", "e.g. {HH}:{mm}"));
  clockGroup.appendChild(createSlider("Font Size", "clockFontSize", 1, 8, 0.1, "rem"));

  const searchGroup = createSettingsGroup(container, "Search Bar");
  searchGroup.appendChild(createSlider("Font Size", "searchFontSize", 0.5, 2, 0.05, "rem"));
  searchGroup.appendChild(createSlider("Width", "searchWidth", 20, 100, 1, "vw"));

  const generalGroup = createSettingsGroup(container, "Footer");
  generalGroup.appendChild(createCheckbox("Show 'made by me' Credit", "showCredit"));
  generalGroup.appendChild(createCheckbox("Show Settings Button (Ctrl+,)", "showSettingsButton"));
  generalGroup.appendChild(createCheckbox("Show Theme Toggle Button (Ctrl+.)", "showThemeButton"));
}

function setupLayoutSettings() {
  const container = document.getElementById("layout-settings-container");
  if (!container) return;

  container.innerHTML = ""; // Clear existing

  // Re-use creator functions by defining them locally or passing them.
  // For simplicity, we'll define them again here.
  const createSelect = (label, element, axis) => {
    const settingDiv = document.createElement("div");
    settingDiv.className = "appearance-setting";
    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    const select = document.createElement("select");
    const options = axis === "v" ? ["top", "center", "bottom"] : ["left", "center", "right"];
    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      select.appendChild(option);
    });
    select.value = ConfigManager.get().positions[element]?.[axis] || (axis === "v" ? "center" : "center");
    select.addEventListener("change", (event) => {
      ConfigManager.get().positions[element][axis] = event.target.value;
      applyCustomPositions();
      ConfigManager.save();
    });
    settingDiv.appendChild(labelEl);
    settingDiv.appendChild(select);
    return settingDiv;
  };
  // This is a copy of the createSlider function from setupAppearanceSettings
  const createSlider = (label, property, min, max, step, unit) => { const settingDiv = document.createElement("div"); settingDiv.className = "appearance-setting"; const labelEl = document.createElement("label"); const valueSpan = document.createElement("span"); labelEl.textContent = `${label}: `; labelEl.appendChild(valueSpan); const slider = document.createElement("input"); slider.type = "range"; slider.min = min; slider.max = max; slider.step = step; slider.value = ConfigManager.get().styles[property]; const updateValue = (value) => { valueSpan.textContent = `${value}${unit}`; }; slider.addEventListener("input", (event) => { const newValue = event.target.value; ConfigManager.get().styles[property] = newValue; updateValue(newValue); applyCustomStyles(); }); slider.addEventListener("change", () => { ConfigManager.save(); }); settingDiv.appendChild(labelEl); settingDiv.appendChild(slider); updateValue(slider.value); return settingDiv; };

  const clockGroup = createSettingsGroup(container, "Clock Position");
  clockGroup.appendChild(createSelect("Vertical", "clock", "v"));
  clockGroup.appendChild(createSelect("Horizontal", "clock", "h"));

  const searchGroup = createSettingsGroup(container, "Search Bar Position");
  searchGroup.appendChild(createSelect("Vertical", "search", "v"));
  searchGroup.appendChild(createSelect("Horizontal", "search", "h"));

  const paddingGroup = createSettingsGroup(container, "Page Padding");
  paddingGroup.appendChild(createSlider("Vertical Edge", "edgePaddingV", 0, 45, 1, "%"));
  paddingGroup.appendChild(createSlider("Horizontal Edge", "edgePaddingH", 0, 45, 1, "%"));
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  ConfigManager.load();
  initializeTheme();
  applyCustomColors();
  applyCustomStyles();
  setupSettingsModal();
  // setupAppearanceSettings and setupLayoutSettings are called from within setupSettingsModal
  setupColorSettings();

  // Pre-render clock to avoid delay
  updateClock();
  // Start the clock after the DOM is loaded and config is ready
  if (document.getElementById("clock")) {
    setInterval(updateClock, 1000);
  }
});
