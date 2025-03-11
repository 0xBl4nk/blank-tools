// JWT Editor functionality
(function() {
    // DOM Elements
    const jwtInput = document.getElementById('jwt-input');
    const headerOutput = document.getElementById('header-output');
    const payloadOutput = document.getElementById('payload-output');
    const signatureOutput = document.getElementById('signature-output');
    const jwtOutput = document.getElementById('jwt-output');
    const tokenStatus = document.getElementById('token-status');
    const copyButton = document.getElementById('copy-button');

    // Variables to store original parts
    let originalHeader = '';
    let originalPayload = '';
    let originalSignature = '';
    let secretKey = '';
    let isUpdating = false;
    let isEdited = false;
    let lastVerificationResult = false; // Track last verification result

    // Function to validate JWT signature
    async function verifyJwt(token, secretKey) {
        try {
            if (!token || !secretKey) return false;
            
            // 1. Split the token
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            // 2. Decode the header to determine the algorithm
            let header;
            try {
                const headerJson = base64UrlDecode(parts[0]);
                header = JSON.parse(headerJson);
            } catch (e) {
                console.error("Failed to parse header:", e);
                return false;
            }
            
            const algorithm = header.alg;
            
            // 3. Prepare the data that was signed (header.payload)
            const signedData = `${parts[0]}.${parts[1]}`;
            
            // 4. Verification based on algorithm
            if (algorithm === 'HS256') {
                // HMAC-SHA256
                const encoder = new TextEncoder();
                const keyData = encoder.encode(secretKey);
                const dataToVerify = encoder.encode(signedData);
                
                try {
                    // Import the key
                    const cryptoKey = await crypto.subtle.importKey(
                        'raw',
                        keyData,
                        { name: 'HMAC', hash: { name: 'SHA-256' } },
                        false,
                        ['sign']
                    );
                    
                    // Generate the signature
                    const signatureBuffer = await crypto.subtle.sign(
                        'HMAC',
                        cryptoKey,
                        dataToVerify
                    );
                    
                    // Convert to base64url
                    const calculatedSignature = arrayBufferToBase64Url(signatureBuffer);
                    
                    // Compare with provided signature
                    return calculatedSignature === parts[2];
                } catch (e) {
                    console.error("Crypto operation failed:", e);
                    return false;
                }
            } else {
                console.error(`Unsupported algorithm: ${algorithm}`);
                return false;
            }
        } catch (error) {
            console.error("Error during verification:", error);
            return false;
        }
    }

    // Function to sign JWT with the appropriate algorithm
    async function signJwt(headerBase64, payloadBase64, secretKey) {
        try {
            // 1. Decode the header to get the algorithm
            const headerJson = base64UrlDecode(headerBase64);
            const header = JSON.parse(headerJson);
            const algorithm = header.alg;
            
            // 2. Prepare the data to be signed
            const dataToSign = `${headerBase64}.${payloadBase64}`;
            
            // 3. Sign based on algorithm
            if (algorithm === 'HS256') {
                const encoder = new TextEncoder();
                const keyData = encoder.encode(secretKey);
                const dataBytes = encoder.encode(dataToSign);
                
                // Import the key
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: { name: 'SHA-256' } },
                    false,
                    ['sign']
                );
                
                // Generate signature
                const signatureBuffer = await crypto.subtle.sign(
                    'HMAC',
                    cryptoKey,
                    dataBytes
                );
                
                // Convert to base64url
                return arrayBufferToBase64Url(signatureBuffer);
            } else {
                console.error(`Unsupported algorithm: ${algorithm}`);
                return '';
            }
        } catch (error) {
            console.error("Error signing JWT:", error);
            return '';
        }
    }

    // Helper function to convert ArrayBuffer to base64url
    function arrayBufferToBase64Url(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // Function to decode base64url to text
    function base64UrlDecode(input) {
        // Replace characters different between base64 and base64url
        input = input.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        switch (input.length % 4) {
            case 0:
                break;
            case 2:
                input += '==';
                break;
            case 3:
                input += '=';
                break;
            default:
                throw new Error('Invalid base64 string');
        }
        
        // Decode base64
        const decoded = atob(input);
        
        // Convert to UTF-8
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
            bytes[i] = decoded.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    // Function to encode text to base64url
    function base64UrlEncode(input) {
        // Convert to UTF-8
        const bytes = new TextEncoder().encode(input);
        
        // Convert to base64
        let base64 = btoa(String.fromCharCode.apply(null, bytes));
        
        // Convert base64 to base64url
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    // Function to update token status indicator
    function updateTokenStatus(isValid, noToken = false) {
        lastVerificationResult = isValid;
        
        if (noToken) {
            tokenStatus.className = 'token-status';
            tokenStatus.innerHTML = '';
            tokenStatus.title = '';
            return;
        }
        
        if (isValid) {
            tokenStatus.className = 'token-status valid';
            tokenStatus.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.00023 16.1698L5.53023 12.6998L4.11523 14.1198L9.00023 18.9998L20.0002 7.99984L18.5852 6.58984L9.00023 16.1698Z" />
                </svg>
            `;
            tokenStatus.title = 'Valid signature: cryptographic verification successful';
        } else {
            tokenStatus.className = 'token-status invalid';
            tokenStatus.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z" />
                </svg>
            `;
            tokenStatus.title = 'Invalid signature: cryptographic verification failed';
        }
    }

    // Function to update output
    async function updateOutput(token) {
        const outputToken = token || jwtInput.value;
        jwtOutput.textContent = outputToken;
        
        // If no token, clear everything
        if (!outputToken || outputToken.trim() === '') {
            jwtOutput.textContent = '';
            updateTokenStatus(false, true);
            return;
        }
        
        // Split token to highlight parts with colors
        const parts = outputToken.split('.');
        if (parts.length >= 2) {
            jwtOutput.innerHTML = `<span class="header-part">${parts[0]}</span>.<span class="payload-part">${parts[1]}</span>`;
            
            // If we have a signature part
            if (parts.length > 2) {
                jwtOutput.innerHTML += `.<span class="signature-part">${parts[2]}</span>`;
                
                // Always attempt verification if we have a secret key
                if (secretKey && secretKey.trim() !== '') {
                    const isValid = await verifyJwt(outputToken, secretKey);
                    updateTokenStatus(isValid);
                } else {
                    updateTokenStatus(false);
                }
            } else {
                // No signature part present
                updateTokenStatus(false);
            }
        } else {
            // Not a properly formatted JWT (needs at least header.payload)
            jwtOutput.textContent = outputToken;
            updateTokenStatus(false);
        }
    }

    // Function to parse JWT token
    async function parseJwt(token) {
        if (isUpdating) return;
        if (!token) {
            headerOutput.value = '';
            payloadOutput.value = '';
            signatureOutput.value = '';
            jwtOutput.textContent = '';
            updateTokenStatus(false, true);
            return;
        }
        
        const parts = token.split('.');
        if (parts.length < 2) return;

        isUpdating = true;
        
        try {
            // Decode and format header
            const headerJson = base64UrlDecode(parts[0]);
            const headerObj = JSON.parse(headerJson);
            headerOutput.value = JSON.stringify(headerObj, null, 4);
            originalHeader = parts[0];
            
            // Decode and format payload
            const payloadJson = base64UrlDecode(parts[1]);
            const payloadObj = JSON.parse(payloadJson);
            payloadOutput.value = JSON.stringify(payloadObj, null, 4);
            originalPayload = parts[1];
            
            // Store original signature if present
            originalSignature = parts.length > 2 ? parts[2] : '';
            
            // Keep existing secret key if it exists
            // This allows the user to keep verifying with their key
            
            // Reset edited flag
            isEdited = false;
            
            // Set output and validate if possible
            await updateOutput(token);
        } catch (error) {
            console.error('Error parsing JWT token:', error);
            updateTokenStatus(false);
        }
        
        isUpdating = false;
    }

    // Function to update JWT token based on edited components
    async function updateJwt() {
        if (isUpdating) return;
        if (!headerOutput.value || !payloadOutput.value) return;
        
        try {
            isUpdating = true;
            
            // Try to encode header
            let headerEncoded;
            try {
                const headerObj = JSON.parse(headerOutput.value);
                headerEncoded = base64UrlEncode(JSON.stringify(headerObj));
            } catch (e) {
                headerEncoded = originalHeader;
                console.error('Error encoding header:', e);
            }
            
            // Try to encode payload
            let payloadEncoded;
            try {
                const payloadObj = JSON.parse(payloadOutput.value);
                payloadEncoded = base64UrlEncode(JSON.stringify(payloadObj));
            } catch (e) {
                payloadEncoded = originalPayload;
                console.error('Error encoding payload:', e);
            }
            
            // Get the secret key from the input
            secretKey = signatureOutput.value.trim();
            
            // Create new JWT token base (header.payload)
            let newJwt = `${headerEncoded}.${payloadEncoded}`;
            
            // Calculate signature if secret key is provided
            if (secretKey) {
                const signature = await signJwt(headerEncoded, payloadEncoded, secretKey);
                if (signature) {
                    newJwt += `.${signature}`;
                }
            }
            
            await updateOutput(newJwt);
            isUpdating = false;
        } catch (error) {
            console.error('Error updating JWT token:', error);
            isUpdating = false;
        }
    }

    // Add event listeners
    jwtInput.addEventListener('input', async () => {
        await parseJwt(jwtInput.value);
    });
    
    headerOutput.addEventListener('input', async () => {
        isEdited = true;
        await updateJwt();
    });
    
    payloadOutput.addEventListener('input', async () => {
        isEdited = true;
        await updateJwt();
    });
    
    // Real-time validation when secret key changes
    signatureOutput.addEventListener('input', async () => {
        secretKey = signatureOutput.value.trim();
        // If we have a complete token, validate it immediately
        const token = jwtInput.value;
        if (token && token.split('.').length === 3) {
            const isValid = await verifyJwt(token, secretKey);
            updateTokenStatus(isValid);
        }
        
        // If editing, regenerate signature
        if (isEdited) {
            await updateJwt();
        }
    });

    // Copy button functionality
    copyButton.addEventListener('click', () => {
        const textToCopy = jwtOutput.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
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
