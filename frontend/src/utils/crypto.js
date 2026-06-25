// Simple client-side symmetric XOR-Base64 encryption helper
const SECRET_KEY = "chat_app_secure_key_123";

export const encryptMessage = (text) => {
  if (!text) return text;
  try {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(unescape(encodeURIComponent(result))); // Base64 encoding safe for unicode
  } catch (e) {
    return text;
  }
};

export const decryptMessage = (encodedText) => {
  if (!encodedText) return encodedText;
  try {
    const decoded = decodeURIComponent(escape(atob(encodedText)));
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  } catch (e) {
    return encodedText; // Return original text if decryption fails
  }
};
