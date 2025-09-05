# FewLy-Torch-1861.github.io

This is the repository for my personal homepage. It's a simple, clean, and fast start page designed for daily use.

## Features

- **Minimalist Design**: Clean and uncluttered interface.
- **Quick Search**: Integrated search bar with custom prefixes for various search engines (Google, YouTube, Stack Overflow, Arch Wiki, DuckDuckGo, Wikipedia, GitHub, Twitter).
- **Dynamic Clock**: Displays the current time.
- **Theme Toggle**: Switch between light and dark modes (Catppuccin Latte and Mocha themes).
- **Responsive**: Adapts to different screen sizes.

## Technologies Used

- HTML5
- CSS3
- JavaScript

## How to Use

Set `https://fewly-torch-1861.github.io/` as your new tab or home page in your browser settings.

## Customization

> [!NOTE]  
> For now, you'll need to fork this repository to apply your own customizations. A settings page is planned for a future update to make this process easier!

### Search Engines

You can customize the search engines and their prefixes in `js/main.js`. Look for the `searchEngines` object:

```javascript
    const searchEngines = {
      "!yt": "https://www.youtube.com/results?search_query=",
      "!so": "https://stackoverflow.com/search?q=",
      "!aw": "https://wiki.archlinux.org/index.php?search=",
      "!ddg": "https://duckduckgo.com/?q=",
      "!wiki": "https://en.wikipedia.org/w/index.php?search=",
      "!g": "https://www.google.com/search?q=",
      "!gh": "https://github.com/search?q=",
      "!tw": "https://twitter.com/search?q=",
      "!": "https://", // Special prefix for direct URL navigation
    };
