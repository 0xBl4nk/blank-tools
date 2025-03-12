// Hex Encoder/Decoder functionality
(function() {
    // DOM Elements
    const hexInput = document.getElementById('hex-input');
    const hexOutput = document.getElementById('hex-output');
    const encodeButton = document.getElementById('hex-encode-button');
    const decodeButton = document.getElementById('hex-decode-button');
    const clearButton = document.getElementById('hex-clear-button');
    const copyButton = document.getElementById('hex-copy-button');
    const uppercaseCheckbox = document.getElementById('hex-uppercase');
    const addPrefixCheckbox = document.getElementById('hex-add-prefix');
    const addSpacesCheckbox = document.getElementById('hex-add-spaces');
    
    // Hex encode function (text to hex)
    function textToHex(input) {
        if (!input) return '';
        
        try {
            // Convert string to hex
            const encoder = new TextEncoder();
            const bytes = encoder.encode(input);
            
            // Format hex based on user options
            let result = '';
            for (let i = 0; i < bytes.length; i++) {
                let byteHex = bytes[i].toString(16).padStart(2, '0');
                
                // Apply uppercase if selected
                if (uppercaseCheckbox.checked) {
                    byteHex = byteHex.toUpperCase();
                }
                
                // Add prefix if selected
                if (addPrefixCheckbox.checked) {
                    byteHex = '0x' + byteHex;
                }
                
                // Add the byte to the result
                result += byteHex;
                
                // Add space if selected (and not the last byte)
                if (addSpacesCheckbox.checked && i < bytes.length - 1) {
                    result += ' ';
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error encoding to hex:', error);
            return `Error encoding: ${error.message}`;
        }
    }
    
    // Hex decode function (hex to text)
    function hexToText(input) {
        if (!input) return '';
        
        try {
            // Clean up the input
            // Remove 0x prefixes, spaces, and convert to lowercase
            let cleanHex = input.replace(/0x/g, '').replace(/\s/g, '');
            
            // Ensure we have an even number of hex digits
            if (cleanHex.length % 2 !== 0) {
                return 'Error: Invalid hex string (odd length)';
            }
            
            // Check if the string contains only valid hex characters
            if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
                return 'Error: Invalid hex string (non-hex characters)';
            }
            
            // Convert hex to bytes
            const bytes = new Uint8Array(cleanHex.length / 2);
            for (let i = 0; i < cleanHex.length; i += 2) {
                bytes[i/2] = parseInt(cleanHex.substring(i, i + 2), 16);
            }
            
            // Convert bytes to string
            return new TextDecoder().decode(bytes);
        } catch (error) {
            console.error('Error decoding hex:', error);
            return `Error decoding: ${error.message}`;
        }
    }
    
    // Encode button click handler
    encodeButton.addEventListener('click', () => {
        const input = hexInput.value;
        hexOutput.value = textToHex(input);
    });
    
    // Decode button click handler
    decodeButton.addEventListener('click', () => {
        const input = hexInput.value;
        hexOutput.value = hexToText(input);
    });
    
    // Clear button click handler
    clearButton.addEventListener('click', () => {
        hexInput.value = '';
        hexOutput.value = '';
    });
    
    // Copy button click handler
    copyButton.addEventListener('click', () => {
        if (!hexOutput.value) return;
        
        navigator.clipboard.writeText(hexOutput.value).then(() => {
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
    
    // Handle format option changes
    const formatOptions = [uppercaseCheckbox, addPrefixCheckbox, addSpacesCheckbox];
    formatOptions.forEach(option => {
        option.addEventListener('change', () => {
            // If we have output already, update it based on new format options
            if (hexOutput.value && hexInput.value) {
                // Re-encode to apply new formatting options
                const originalText = hexToText(hexInput.value);
                if (originalText && !originalText.startsWith('Error:')) {
                    hexOutput.value = textToHex(originalText);
                }
            }
        });
    });
})();
