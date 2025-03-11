// jwtEditor.js 

import { base64UrlDecode, base64UrlEncode, verifyJwt, signJwt } from './jwtUtils.js';

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
let lastVerificationResult = false;

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
    if (!outputToken || outputToken.trim() === '') {
        jwtOutput.textContent = '';
        updateTokenStatus(false, true);
        return;
    }
    const parts = outputToken.split('.');
    if (parts.length >= 2) {
        jwtOutput.innerHTML = `<span class="header-part">${parts[0]}</span>.<span class="payload-part">${parts[1]}</span>`;
        if (parts.length > 2) {
            jwtOutput.innerHTML += `.<span class="signature-part">${parts[2]}</span>`;
            if (secretKey && secretKey.trim() !== '') {
                const isValid = await verifyJwt(outputToken, secretKey);
                updateTokenStatus(isValid);
            } else {
                updateTokenStatus(false);
            }
        } else {
            updateTokenStatus(false);
        }
    } else {
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
        const headerJson = base64UrlDecode(parts[0]);
        const headerObj = JSON.parse(headerJson);
        headerOutput.value = JSON.stringify(headerObj, null, 4);
        originalHeader = parts[0];
        const payloadJson = base64UrlDecode(parts[1]);
        const payloadObj = JSON.parse(payloadJson);
        payloadOutput.value = JSON.stringify(payloadObj, null, 4);
        originalPayload = parts[1];
        originalSignature = parts.length > 2 ? parts[2] : '';
        isEdited = false;
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
        let headerEncoded;
        try {
            const headerObj = JSON.parse(headerOutput.value);
            headerEncoded = base64UrlEncode(JSON.stringify(headerObj));
        } catch (e) {
            headerEncoded = originalHeader;
            console.error('Error encoding header:', e);
        }
        let payloadEncoded;
        try {
            const payloadObj = JSON.parse(payloadOutput.value);
            payloadEncoded = base64UrlEncode(JSON.stringify(payloadObj));
        } catch (e) {
            payloadEncoded = originalPayload;
            console.error('Error encoding payload:', e);
        }
        secretKey = signatureOutput.value.trim();
        let newJwt = `${headerEncoded}.${payloadEncoded}`;
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
function initializeJwtEditor() {
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

    signatureOutput.addEventListener('input', async () => {
        secretKey = signatureOutput.value.trim();
        const token = jwtInput.value;
        if (token && token.split('.').length === 3) {
            const isValid = await verifyJwt(token, secretKey);
            updateTokenStatus(isValid);
        }
        if (isEdited) {
            await updateJwt();
        }
    });

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
}

// Export the initialize function
export { initializeJwtEditor as jwtEditor };