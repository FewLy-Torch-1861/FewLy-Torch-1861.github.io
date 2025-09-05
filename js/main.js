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

    window.location.href = `${searchUrl}${encodeURIComponent(query)}`;
  });
}
