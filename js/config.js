const ConfigManager = (function () {
  /**
   * Defines the default configuration for the application.
   * This object serves as the template for a new user's settings and
   * as a fallback if a user's stored configuration is missing properties
   * (e.g., after an application update that adds new settings).
   */
  const defaultConfig = {
    colors: {
      accent: null,
      clock: null,
      greeting: null,
    },
    styles: {
      clockFontSize: "2.5", // rem
      searchFontSize: "1", // rem
      searchWidth: "50", // vw
      clockFormat: "it's {HH}:{mm}:{ss} now!",
      greetingText: "Hello, Homie!",
      greetingFontSize: "1.5", // rem
      showCredit: true,
      showSettingsButton: true,
      showThemeButton: true,
      showGreeting: true,
    },
    positions: {
      clock: { anchor: "center", x: "0vw", y: "-5vh" },
      search: { anchor: "center", x: "0vw", y: "5vh" },
      greeting: { anchor: "top-center", x: "0vw", y: "5vh" },
    },
    // These settings are no longer used by the new search bar.
    searchEngines: {
      // This section is preserved for potential future use or re-integration.
    },
  };

  // Initialize the live config with a deep copy of the defaults.
  let config = JSON.parse(JSON.stringify(defaultConfig));

  /**
   * Recursively merges properties from a source object into a target object.
   * This is crucial for updating the user's config with new default values
   * without overwriting their existing customizations.
   * @param {object} target - The object to merge into (e.g., the new default config).
   * @param {object} source - The object with user-saved values (e.g., from localStorage).
   * @returns {object} The merged target object.
   */
  function deepMerge(target, source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          // If the key exists in source and is an object, recurse.
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  return {
    /**
     * Returns the current, in-memory configuration object.
     */
    get: () => config,

    /**
     * Loads the configuration from localStorage. It merges the stored config
     * into a fresh copy of the default config to ensure all properties are present.
     */
    load: () => {
      const storedConfig = localStorage.getItem("config");
      if (storedConfig) {
        const loadedConfig = JSON.parse(storedConfig);
        // Create a new config based on defaults, then merge the user's saved settings into it.
        const newConfig = JSON.parse(JSON.stringify(defaultConfig));
        config = deepMerge(newConfig, loadedConfig);
      }
    },

    /** Saves the current in-memory config to localStorage. */
    save: () => localStorage.setItem("config", JSON.stringify(config)),

    /** Removes the user's configuration from localStorage, effectively resetting to defaults on next load. */
    reset: () => localStorage.removeItem("config"),
  };
})();