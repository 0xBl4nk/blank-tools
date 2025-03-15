// URL Encoder/Decoder functionality
// Immediately-invoked function expression to create encapsulated scope
(function() {
    // DOM Elements - safely check for existence before accessing them
    const urlInput = document.getElementById('url-input');
    const urlOutput = document.getElementById('url-output');
    const urlEncodeButton = document.getElementById('url-encode-button');
    const urlDecodeButton = document.getElementById('url-decode-button');
    const urlClearButton = document.getElementById('url-clear-button');
    const urlCopyButton = document.getElementById('url-copy-button');
    const urlComponentMode = document.getElementById('url-component-mode');
    
    // Guard clause - don't proceed if we're not on the URL encoder page
    if (!urlInput || !urlOutput || !urlEncodeButton || !urlDecodeButton) {
        console.log('URL encoder tool elements not found, not initializing');
        return;
    }
    
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
    
    // Event handler functions
    function handleEncode() {
        const input = urlInput.value;
        const useComponent = urlComponentMode.checked;
        urlOutput.value = encodeURL(input, useComponent);
    }
    
    function handleDecode() {
        const input = urlInput.value;
        const useComponent = urlComponentMode.checked;
        urlOutput.value = decodeURL(input, useComponent);
    }
    
    function handleClear() {
        urlInput.value = '';
        urlOutput.value = '';
    }
    
    function handleCopy() {
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
    }
    
    // Add event listeners
    urlEncodeButton.addEventListener('click', handleEncode);
    urlDecodeButton.addEventListener('click', handleDecode);
    urlClearButton.addEventListener('click', handleClear);
    urlCopyButton.addEventListener('click', handleCopy);
    
    // Register cleanup function
    if (window.registerToolCleanup) {
        window.registerToolCleanup(function() {
            console.log('Cleaning up URL Encoder tool...');
            
            // Remove all event listeners
            if (urlEncodeButton) urlEncodeButton.removeEventListener('click', handleEncode);
            if (urlDecodeButton) urlDecodeButton.removeEventListener('click', handleDecode);
            if (urlClearButton) urlClearButton.removeEventListener('click', handleClear);
            if (urlCopyButton) urlCopyButton.removeEventListener('click', handleCopy);
        });
    }
    
    console.log('URL encoder tool initialized successfully');
})();
