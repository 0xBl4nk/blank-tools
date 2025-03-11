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
    const fileModeCheckbox = document.getElementById('base64-file-mode');
    const fileControls = document.getElementById('file-controls');
    const fileInput = document.getElementById('base64-file-input');
    const downloadButton = document.getElementById('base64-download-button');
    
    // Variables for file handling
    let currentFile = null;
    let currentBlob = null;
    
    // Base64 encode function
    function encodeBase64(input, urlSafe = false) {
        // If no input, return empty string
        if (!input) return '';
        
        // Convert to base64
        let base64;
        
        // Check if input is already a string
        if (typeof input === 'string') {
            base64 = btoa(unescape(encodeURIComponent(input)));
        } else {
            // Handle ArrayBuffer for file data
            const bytes = new Uint8Array(input);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            base64 = btoa(binary);
        }
        
        // Make URL safe if requested
        if (urlSafe) {
            base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        
        return base64;
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
            
            // Decode base64
            return decodeURIComponent(escape(atob(input)));
        } catch (error) {
            console.error('Error decoding base64:', error);
            return `Error decoding: ${error.message}`;
        }
    }
    
    // Function to encode file to base64
    function encodeFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const arrayBuffer = event.target.result;
                    const base64 = encodeBase64(arrayBuffer, urlSafeCheckbox.checked);
                    resolve(base64);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function(error) {
                reject(error);
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Function to decode base64 to file
    function decodeBase64ToFile(base64String, mimeType = 'application/octet-stream') {
        try {
            // Handle URL-safe base64
            if (urlSafeCheckbox.checked) {
                base64String = base64String.replace(/-/g, '+').replace(/_/g, '/');
                // Add padding if necessary
                while (base64String.length % 4) {
                    base64String += '=';
                }
            }
            
            // Convert base64 to binary
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Create blob from binary data
            return new Blob([bytes], { type: mimeType });
        } catch (error) {
            console.error('Error decoding base64 to file:', error);
            return null;
        }
    }
    
    // Function to toggle file mode
    function toggleFileMode() {
        const isFileMode = fileModeCheckbox.checked;
        
        if (isFileMode) {
            // Show file controls
            fileControls.style.display = 'flex';
            base64Input.placeholder = 'Select a file to encode or paste base64 to decode to file...';
            
            // Set base64 output as readonly
            base64Output.readOnly = true;
        } else {
            // Hide file controls
            fileControls.style.display = 'none';
            base64Input.placeholder = 'Enter text to encode or decode...';
        }
    }
    
    // Encode button click handler
    encodeButton.addEventListener('click', async () => {
        if (fileModeCheckbox.checked) {
            // File mode
            if (currentFile) {
                try {
                    const base64 = await encodeFileToBase64(currentFile);
                    base64Output.value = base64;
                    // Enable download button (for copying elsewhere)
                    downloadButton.disabled = true;
                } catch (error) {
                    console.error('Error encoding file:', error);
                    base64Output.value = `Error encoding file: ${error.message}`;
                }
            } else if (base64Input.value) {
                // If there's text but no file, treat as normal text encoding
                base64Output.value = encodeBase64(base64Input.value, urlSafeCheckbox.checked);
            }
        } else {
            // Normal text mode
            base64Output.value = encodeBase64(base64Input.value, urlSafeCheckbox.checked);
        }
    });
    
    // Decode button click handler
    decodeButton.addEventListener('click', () => {
        if (fileModeCheckbox.checked) {
            // File mode - base64 to file
            try {
                const base64 = base64Input.value.trim();
                if (!base64) return;
                
                currentBlob = decodeBase64ToFile(base64);
                
                if (currentBlob) {
                    base64Output.value = 'Base64 decoded successfully. Click "Download File" to save.';
                    downloadButton.disabled = false;
                } else {
                    base64Output.value = 'Failed to decode base64 to file.';
                    downloadButton.disabled = true;
                }
            } catch (error) {
                console.error('Error decoding base64 to file:', error);
                base64Output.value = `Error decoding to file: ${error.message}`;
                downloadButton.disabled = true;
            }
        } else {
            // Normal text mode
            base64Output.value = decodeBase64(base64Input.value, urlSafeCheckbox.checked);
        }
    });
    
    // Clear button click handler
    clearButton.addEventListener('click', () => {
        base64Input.value = '';
        base64Output.value = '';
        currentFile = null;
        currentBlob = null;
        downloadButton.disabled = true;
        fileInput.value = '';
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
    
    // File input change handler
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            currentFile = file;
            base64Input.value = `File selected: ${file.name} (${formatFileSize(file.size)})`;
            base64Output.value = '';
            downloadButton.disabled = true;
        }
    });
    
    // Download button click handler
    downloadButton.addEventListener('click', () => {
        if (!currentBlob) return;
        
        // Create download link
        const url = URL.createObjectURL(currentBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded_file';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });
    
    // File mode checkbox handler
    fileModeCheckbox.addEventListener('change', toggleFileMode);
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Initialize file mode state
    toggleFileMode();
})();
