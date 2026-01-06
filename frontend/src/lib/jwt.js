/**
 * Decodes a JWT token to extract the payload using pure JavaScript.
 * Does not validate the signature, only decodes the payload.
 * 
 * @param {string} token - The JWT access token
 * @returns {object|null} - The decoded payload object or null if invalid
 */
export const decodeJWT = (token) => {
    try {
        if (!token) return null;

        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};
