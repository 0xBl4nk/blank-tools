// URL Encoder/Decoder functionality
(function() {
    // DOM Elements
    const urlInput = document.getElementById('url-input');
    const urlOutput = document.getElementById('url-output');
    const urlEncodeButton = document.getElementById('url-encode-button');
    const urlDecodeButton = document.getElementById('url-decode-button');
    const urlClearButton = document.getElementById('url-clear-button');
    const urlCopyButton = document.getElementById('url-copy-button');
    const urlComponentMode = document.getElementById('url-component-mode');
    
    // URL Encoder function
    function encodeURL(text, useComponent = false) {
        if (!text) return '';
        return useComponent ? encodeURIComponent(text) : encodeURI(text);
    }
    
    // URL Decoder function
    function decodeURL(text, useComponent = false) {
        if (!text) return '';
        try {
            return useComponent ? decodeURIComponent(text) : decodeURI(text);
        } catch (error) {
            console.error('Decoding error:', error);
            return `Error decoding: ${error.message}`;
        }
    }
    
    // Encode button click handler
    urlEncodeButton.addEventListener('click', () => {
        const input = urlInput.value;
        const useComponent = urlComponentMode.checked;
        urlOutput.value = encodeURL(input, useComponent);
    });
    
    // Decode button click handler
    urlDecodeButton.addEventListener('click', () => {
        const input = urlInput.value;
        const useComponent = urlComponentMode.checked;
        urlOutput.value = decodeURL(input, useComponent);
    });
    
    // Clear button click handler
    urlClearButton.addEventListener('click', () => {
        urlInput.value = '';
        urlOutput.value = '';
    });
    
    // Copy button click handler
    urlCopyButton.addEventListener('click', () => {
        if (!urlOutput.value) return;
        
        navigator.clipboard.writeText(urlOutput.value).then(() => {
            const originalText = urlCopyButton.innerHTML;
            urlCopyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.00023 16.1698L5.53023 12.6998L4.11523 14.1198L9.00023 18.9998L20.0002 7.99984L18.5852 6.58984L9.00023 16.1698Z" />
                </svg>
                Copied!
            `;
            setTimeout(() => {
                urlCopyButton.innerHTML = originalText;
            }, 2000);
        });
    });
})();
