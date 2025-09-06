const ConfigManager = (function () {
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
  };

  let config = JSON.parse(JSON.stringify(defaultConfig)); // Deep copy

  function deepMerge(target, source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          // Ensure the target has an object to merge into
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
    get: () => config,
    load: () => {
      const storedConfig = localStorage.getItem("config");
      if (storedConfig) {
        const loadedConfig = JSON.parse(storedConfig);
        // Start with a fresh deep copy of defaultConfig and merge the loaded one into it.
        const newConfig = JSON.parse(JSON.stringify(defaultConfig));
        config = deepMerge(newConfig, loadedConfig);
      }
    },
    save: () => localStorage.setItem("config", JSON.stringify(config)),
    reset: () => localStorage.removeItem("config"),
  };
})();