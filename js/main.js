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

// Update the clock every second
setInterval(updateClock, 1000);

// Initial call to display the clock immediately
updateClock();

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    const rawQuery = searchInput.value.trim();
    if (!rawQuery) {
      return;
    }

    const searchEngines = {
      "!yt": "https://www.youtube.com/results?search_query=",
      "!so": "https://stackoverflow.com/search?q=",
      "!aw": "https://wiki.archlinux.org/index.php?search=",
      "!ddg": "https://duckduckgo.com/?q=",
      "!wiki": "https://en.wikipedia.org/w/index.php?search=",
      "!g": "https://www.google.com/search?q=",
      "!gh": "https://github.com/search?q=",
      "!tw": "https://twitter.com/search?q=",
      "!": "https://",
    };
    const defaultSearchEngine = "https://www.google.com/search?q=";

    const parts = rawQuery.split(" ");
    const prefix = parts[0];

    let searchUrl = defaultSearchEngine;
    let query = rawQuery;

    if (searchEngines[prefix]) {
      searchUrl = searchEngines[prefix];
      query = parts.slice(1).join(" ");
    }

    // Special handling for '!' to allow for http:// and https://
    if (prefix === "!") {
      if (query.startsWith("http://") || query.startsWith("https://")) {
        window.location.href = query;
      } else {
        window.location.href = `https://${query}`;
      }
      return;
    }

    window.location.href = `${searchUrl}${encodeURIComponent(query)}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("theme-toggle");
  const body = document.body;

  const storedTheme = localStorage.getItem("theme");

  function setTheme(theme) {
    if (theme === "dark-mode") {
      body.classList.add("dark-mode");
      toggleButton.textContent = "☀️"; // Sun emoji for dark mode
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      toggleButton.textContent = "🌙"; // Moon emoji for light mode
      localStorage.setItem("theme", "light-mode");
    }
  }

  if (storedTheme) {
    setTheme(storedTheme);
  } else {
    // If no theme is stored, check user's system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark-mode" : "light-mode");
  }

  toggleButton.addEventListener("click", () => {
    if (body.classList.contains("dark-mode")) {
      setTheme("light-mode");
    } else {
      setTheme("dark-mode");
    }
  });
});
