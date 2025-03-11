// Base64 Encoder/Decoder functionality
(function() {
    // DOM Elements
    const base64Input = document.getElementById('base64-input');
    const base64Output = document.getElementById('base64-output');
    const encodeButton = document.getElementById('base64-encode-button');
    const decodeButton = document.getElementById('base64-decode-button');
    const clearButton = document.getElementById('base64-clear-button');
    const copyButton = document.getElementById('base64-copy-button');
    const urlSafeCheckbox = document.getElementById('base64-url-safe');
    
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
    
    // Encode button click handler
    encodeButton.addEventListener('click', () => {
        const input = base64Input.value;
        const urlSafe = urlSafeCheckbox.checked;
        base64Output.value = encodeBase64(input, urlSafe);
    });
    
    // Decode button click handler
    decodeButton.addEventListener('click', () => {
        const input = base64Input.value;
        const urlSafe = urlSafeCheckbox.checked;
        base64Output.value = decodeBase64(input, urlSafe);
    });
    
    // Clear button click handler
    clearButton.addEventListener('click', () => {
        base64Input.value = '';
        base64Output.value = '';
    });
    
    // Copy button click handler
    copyButton.addEventListener('click', () => {
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
    });
})();
