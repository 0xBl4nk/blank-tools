# Blank Tools

A modern, sleek collection of web-based tools for security researchers, penetration testers, CTF players, and bug bounty hunters. Built with a dynamic, SPA-like interface for seamless tool switching without page reloads.

![Blank Tools Screenshot](https://i.imgur.com/ATpKwKh.png)

## Features

- **Modern UI**: Clean, dark-mode interface inspired by Vercel's design language
- **Dynamic Tool Loading**: Switch between tools instantly without page refreshes
- **Responsive Design**: Works on desktop and mobile devices
- **Expandable Architecture**: Easily add new tools with minimal code changes

## Current Tools

- **JWT Editor**: Decode, edit, and sign JWT tokens with real-time signature validation
- **URL Encoder/Decoder**: Encode and decode URL strings with support for different encoding modes
- **Base64 Encoder/Decoder**: Convert text to and from Base64 with URL-safe option

## Installation

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/0xbl4nk/blank-tools.git
   cd blank-tools
   ```

2. Start a local web server (any of these options):
   ```
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. Visit `http://localhost:8000` in your browser

### Production Deployment

- Upload the files to any web server
- No server-side processing is required; everything runs in the browser
- Compatible with GitHub Pages, Netlify, Vercel, or any static hosting

## Project Structure

```
blank-tools/
├── index.html              # Main page and structure
├── css/
│   ├── main.css            # Core styles
│   └── components.css      # Reusable component styles
├── js/
│   └── main.js             # Navigation and tool loading logic
└── tools/
    ├── jwt-editor/         # JWT Editor Tool
    │   ├── index.html      # Tool's HTML content
    │   ├── style.css       # Tool-specific styles
    │   └── script.js       # Tool-specific JavaScript
    ├── url-encoder/        # URL Encoder Tool
    │   ├── index.html      # Tool's HTML content
    │   ├── style.css       # Tool-specific styles
    │   └── script.js       # Tool-specific JavaScript
    └── base64/             # Base64 Encoder Tool
        ├── index.html      # Tool's HTML content
        ├── style.css       # Tool-specific styles
        └── script.js       # Tool-specific JavaScript
```

## How to Use

### JWT Editor

1. Paste your JWT token in the input field
2. Edit the header or payload as needed
3. Enter your secret key to verify or generate a new signature
4. The token's validity is shown in real-time (✓ or ✗)
5. Copy the resulting token using the Copy button

### URL Encoder/Decoder

1. Enter text in the input field
2. Click "Encode" to URL encode or "Decode" to URL decode
3. Toggle "Use encodeURIComponent" for stricter encoding (encodes more characters)
4. Copy the result using the Copy button

### Base64 Encoder/Decoder

1. Enter text in the input field
2. Click "Encode" to convert to Base64 or "Decode" to convert from Base64
3. Toggle "URL-safe encoding" to make Base64 safe for URLs
4. Copy the result using the Copy button

## Adding New Tools

To add a new tool to Blank Tools:

1. Create a new directory in the `tools/` folder:
   ```
   mkdir tools/your-tool-name
   ```

2. Create the required files:
   - `index.html`: The tool's HTML content (without HTML, HEAD, BODY tags)
   - `style.css`: Tool-specific styles
   - `script.js`: Tool-specific JavaScript wrapped in an IIFE

3. Add a navigation link in `index.html`:
   ```html
   <li class="tool-item" data-tool="your-tool-name">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
           <!-- Your tool icon path here -->
       </svg>
       Your Tool Name
   </li>
   ```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

[Blank](https://github.com/0xbl4nk)
