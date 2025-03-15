// jwtUtils.js

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
   input = input.replace(/-/g, '+').replace(/_/g, '/');
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
   const decoded = atob(input);
   const bytes = new Uint8Array(decoded.length);
   for (let i = 0; i < decoded.length; i++) {
       bytes[i] = decoded.charCodeAt(i);
   }
   return new TextDecoder().decode(bytes);
}

// Function to encode text to base64url
function base64UrlEncode(input) {
   const bytes = new TextEncoder().encode(input);
   let base64 = btoa(String.fromCharCode.apply(null, bytes));
   return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Function to validate JWT signature
async function verifyJwt(token, secretKey) {
   try {
       if (!token || !secretKey) return false;
       const parts = token.split('.');
       if (parts.length !== 3) return false;
       let header;
       try {
           const headerJson = base64UrlDecode(parts[0]);
           header = JSON.parse(headerJson);
       } catch (e) {
           console.error("Failed to parse header:", e);
           return false;
       }
       const algorithm = header.alg;
       const signedData = `${parts[0]}.${parts[1]}`;
       if (algorithm === 'HS256') {
           const encoder = new TextEncoder();
           const keyData = encoder.encode(secretKey);
           const dataToVerify = encoder.encode(signedData);
           try {
               const cryptoKey = await crypto.subtle.importKey(
                   'raw',
                   keyData,
                   { name: 'HMAC', hash: { name: 'SHA-256' } },
                   false,
                   ['sign']
               );
               const signatureBuffer = await crypto.subtle.sign(
                   'HMAC',
                   cryptoKey,
                   dataToVerify
               );
               const calculatedSignature = arrayBufferToBase64Url(signatureBuffer);
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
       const headerJson = base64UrlDecode(headerBase64);
       const header = JSON.parse(headerJson);
       const algorithm = header.alg;
       const dataToSign = `${headerBase64}.${payloadBase64}`;
       if (algorithm === 'HS256') {
           const encoder = new TextEncoder();
           const keyData = encoder.encode(secretKey);
           const dataBytes = encoder.encode(dataToSign);
           const cryptoKey = await crypto.subtle.importKey(
               'raw',
               keyData,
               { name: 'HMAC', hash: { name: 'SHA-256' } },
               false,
               ['sign']
           );
           const signatureBuffer = await crypto.subtle.sign(
               'HMAC',
               cryptoKey,
               dataBytes
           );
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
