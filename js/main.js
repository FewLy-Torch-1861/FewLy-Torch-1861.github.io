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
    const query = searchInput.value;
    if (query) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;
    }
  });
}
