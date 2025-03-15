// Base64 Encoder/Decoder functionality
// Immediately-invoked function expression to create encapsulated scope
(function() {
    // DOM Elements - safely check for existence before accessing them
    const base64Input = document.getElementById('base64-input');
    const base64Output = document.getElementById('base64-output');
    const encodeButton = document.getElementById('base64-encode-button');
    const decodeButton = document.getElementById('base64-decode-button');
    const clearButton = document.getElementById('base64-clear-button');
    const copyButton = document.getElementById('base64-copy-button');
    const urlSafeCheckbox = document.getElementById('base64-url-safe');
    
    // Guard clause - don't proceed if we're not on the base64 page
    if (!base64Input || !base64Output || !encodeButton || !decodeButton) {
        console.log('Base64 tool elements not found, not initializing');
        return;
    }
    
    // Base64 encode function
    function encodeBase64(input, urlSafe = false) {
        // If no input, return empty string
        if (!input) return '';
        
        // Convert to base64
        let base64;
        
        try {
            // Convert to base64 with UTF-8 support
            base64 = btoa(unescape(encodeURIComponent(input)));
            
            // Make URL safe if requested
            if (urlSafe) {
                base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            }
            
            return base64;
        } catch (error) {
            console.error('Error encoding to base64:', error);
            return `Error encoding: ${error.message}`;
        }
    }
    
    // Base64 decode function
    function decodeBase64(input, urlSafe = false) {
        if (!input) return '';
        
        try {
            // Handle URL-safe base64
            if (urlSafe) {
                input = input.replace(/-/g, '+').replace(/_/g, '/');
                // Add padding if necessary
                while (input.length % 4) {
                    input += '=';
                }
            }
            
            // Decode base64 with UTF-8 support
            return decodeURIComponent(escape(atob(input)));
        } catch (error) {
            console.error('Error decoding base64:', error);
            return `Error decoding: ${error.message}`;
        }
    }
    
    // Event handler functions
    function handleEncode() {
        const input = base64Input.value;
        const urlSafe = urlSafeCheckbox.checked;
        base64Output.value = encodeBase64(input, urlSafe);
    }
    
    function handleDecode() {
        const input = base64Input.value;
        const urlSafe = urlSafeCheckbox.checked;
        base64Output.value = decodeBase64(input, urlSafe);
    }
    
    function handleClear() {
        base64Input.value = '';
        base64Output.value = '';
    }
    
    function handleCopy() {
        if (!base64Output.value) return;
        
        navigator.clipboard.writeText(base64Output.value).then(() => {
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.00023 16.1698L5.53023 12.6998L4.11523 14.1198L9.00023 18.9998L20.0002 7.99984L18.5852 6.58984L9.00023 16.1698Z" />
                </svg>
                Copied!
            `;
            setTimeout(() => {
                copyButton.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // Add event listeners
    encodeButton.addEventListener('click', handleEncode);
    decodeButton.addEventListener('click', handleDecode);
    clearButton.addEventListener('click', handleClear);
    copyButton.addEventListener('click', handleCopy);
    
    // Register cleanup function
    if (window.registerToolCleanup) {
        window.registerToolCleanup(function() {
            console.log('Cleaning up Base64 tool...');
            
            // Remove all event listeners
            if (encodeButton) encodeButton.removeEventListener('click', handleEncode);
            if (decodeButton) decodeButton.removeEventListener('click', handleDecode);
            if (clearButton) clearButton.removeEventListener('click', handleClear);
            if (copyButton) copyButton.removeEventListener('click', handleCopy);
        });
    }
    
    console.log('Base64 tool initialized successfully');
})();
