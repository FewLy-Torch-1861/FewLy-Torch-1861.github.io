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
    },
    styles: {
      clockFontSize: "2.5", // rem
      searchFontSize: "1", // rem
      searchWidth: "50", // vw
      clockFormat: "it's {HH}:{mm}:{ss} now!",
      edgePaddingV: "5", // %
      edgePaddingH: "5", // %
      showCredit: true,
      showSettingsButton: true,
      showThemeButton: true,
    },
    positions: {
      clock: { v: "center", h: "center" },
      search: { v: "center", h: "center" },
    },
  };

  let config = JSON.parse(JSON.stringify(defaultConfig)); // Deep copy

  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
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
        config = deepMerge(config, loadedConfig);
      }
    },
    save: () => localStorage.setItem("config", JSON.stringify(config)),
    reset: () => localStorage.removeItem("config"),
  };
})();