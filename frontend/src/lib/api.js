/**
 * API Integration Layer
 *
 * This file contains all API endpoints and request methods.
 * TODO: Replace mock responses with actual Django REST Framework endpoints
 *
 * Django Backend URLs (Update with your actual backend URL):
 * - Development: http://localhost:8000
 * - Production: https://your-backend-domain.com
 */
const API_BASE_URL = 'http://localhost:8000'; // TODO: Update with your Django backend URL
// Helper function to get JWT token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('access_token');
};
// Helper function to make authenticated requests
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };
    // For file uploads, don't set Content-Type (browser will set it with boundary)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, try to refresh
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry the original request
                    return apiRequest(endpoint, options);
                }
                else {
                    // Refresh failed, logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}
// Refresh access token
async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken)
        return false;
    try {
        const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
// AUTHENTICATION ENDPOINTS
export const authAPI = {
    // POST /api/auth/register/
    register: async (data) => {
        console.log('📤 POST /api/auth/register/', data);
        // TODO: Uncomment for real API
        // return apiRequest('/api/auth/register/', {
        //   method: 'POST',
        //   body: JSON.stringify(data),
        // });
        // Mock response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    message: 'User registered successfully',
                    user_id: Math.random().toString(36).substr(2, 9),
                });
            }, 500);
        });
    },
    // POST /api/token/
    login: async (email, password) => {
        console.log('📤 POST /api/token/', { email, password });
        // TODO: Uncomment for real API
        // const data = await apiRequest('/api/token/', {
        //   method: 'POST',
        //   body: JSON.stringify({ email, password }),
        // });
        // localStorage.setItem('access_token', data.access);
        // localStorage.setItem('refresh_token', data.refresh);
        // return data;
        // Mock response
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockTokens = {
                    access: 'mock_access_token_' + Date.now(),
                    refresh: 'mock_refresh_token_' + Date.now(),
                    user: {
                        id: '1',
                        email: email,
                        first_name: 'John',
                        last_name: 'Doe',
                        phone_verified: true,
                        is_verified_identity: true,
                    },
                };
                localStorage.setItem('access_token', mockTokens.access);
                localStorage.setItem('refresh_token', mockTokens.refresh);
                resolve(mockTokens);
            }, 500);
        });
    },
    // POST /api/auth/password-reset/
    requestPasswordReset: async (email) => {
        console.log('📤 POST /api/auth/password-reset/', { email });
        return apiRequest('/api/auth/password-reset/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },
    // POST /api/auth/password-reset-confirm/
    confirmPasswordReset: async (uid, token, new_password) => {
        console.log('📤 POST /api/auth/password-reset-confirm/');
        return apiRequest('/api/auth/password-reset-confirm/', {
            method: 'POST',
            body: JSON.stringify({ uid, token, new_password }),
        });
    },
    // POST /api/auth/verify-phone/
    sendWhatsAppOTP: async (phone_number) => {
        console.log('📤 POST /api/auth/verify-phone/', { phone_number });
        console.log('💬 WhatsApp OTP will be sent to:', phone_number);
        // TODO: Uncomment for real API
        // return apiRequest('/api/auth/verify-phone/', {
        //   method: 'POST',
        //   body: JSON.stringify({ phone_number }),
        // });
        // Mock response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'sent',
                    expires_in: 600,
                    message: 'WhatsApp verification code sent',
                });
            }, 800);
        });
    },
    // POST /api/auth/confirm-otp/
    confirmOTP: async (phone_number, otp_code) => {
        console.log('📤 POST /api/auth/confirm-otp/', { phone_number, otp_code });
        // TODO: Uncomment for real API
        // return apiRequest('/api/auth/confirm-otp/', {
        //   method: 'POST',
        //   body: JSON.stringify({ phone_number, otp_code }),
        // });
        // Mock response
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (otp_code === '123456') {
                    resolve({ status: 'verified' });
                }
                else {
                    reject({ error: 'Invalid code', attempts_remaining: 2 });
                }
            }, 500);
        });
    },
    // POST /api/auth/veriff/create-session/
    createVeriffSession: async () => {
        console.log('📤 POST /api/auth/veriff/create-session/');
        return apiRequest('/api/auth/veriff/create-session/', {
            method: 'POST',
        });
    },
    // POST /api/auth/upload-id/ (Fallback for manual verification)
    uploadID: async (formData) => {
        console.log('📤 POST /api/auth/upload-id/');
        return apiRequest('/api/auth/upload-id/', {
            method: 'POST',
            body: formData,
        });
    },
};
// LISTINGS ENDPOINTS
export const listingsAPI = {
    // GET /api/listings/
    getAll: async (params) => {
        const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
        console.log('📤 GET /api/listings/' + queryString);
        // TODO: Uncomment for real API
        // return apiRequest('/api/listings/' + queryString);
        // Mock response (will be replaced with actual API call)
        return Promise.resolve({ results: [], count: 0 });
    },
    // GET /api/listings/search/
    search: async (params) => {
        const queryString = '?' + new URLSearchParams(params).toString();
        console.log('📤 GET /api/listings/search/' + queryString);
        return apiRequest('/api/listings/search/' + queryString);
    },
    // POST /api/listings/ai-search/
    aiSearch: async (prompt) => {
        console.log('📤 POST /api/listings/ai-search/', { prompt });
        console.log('🤖 AI Search Query:', prompt);
        return apiRequest('/api/listings/ai-search/', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
        });
    },
    // POST /api/listings/
    create: async (data) => {
        console.log('📤 POST /api/listings/', data);
        return apiRequest('/api/listings/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    // GET /api/listings/{id}/
    getById: async (id) => {
        console.log(`📤 GET /api/listings/${id}/`);
        return apiRequest(`/api/listings/${id}/`);
    },
    // PUT /api/listings/{id}/
    update: async (id, data) => {
        console.log(`📤 PUT /api/listings/${id}/`, data);
        return apiRequest(`/api/listings/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    // DELETE /api/listings/{id}/
    delete: async (id) => {
        console.log(`📤 DELETE /api/listings/${id}/`);
        return apiRequest(`/api/listings/${id}/`, {
            method: 'DELETE',
        });
    },
};
// RENTALS ENDPOINTS
export const rentalsAPI = {
    // POST /api/rentals/request/
    createRequest: async (data) => {
        console.log('📤 POST /api/rentals/request/', data);
        return apiRequest('/api/rentals/request/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    // GET /api/rentals/incoming/
    getIncoming: async () => {
        console.log('📤 GET /api/rentals/incoming/');
        return apiRequest('/api/rentals/incoming/');
    },
    // POST /api/rentals/{id}/accept/
    accept: async (id) => {
        console.log(`📤 POST /api/rentals/${id}/accept/`);
        return apiRequest(`/api/rentals/${id}/accept/`, {
            method: 'POST',
        });
    },
    // POST /api/rentals/{id}/reject/
    reject: async (id) => {
        console.log(`📤 POST /api/rentals/${id}/reject/`);
        return apiRequest(`/api/rentals/${id}/reject/`, {
            method: 'POST',
        });
    },
    // POST /api/rentals/{id}/confirm/
    confirm: async (id) => {
        console.log(`📤 POST /api/rentals/${id}/confirm/`);
        return apiRequest(`/api/rentals/${id}/confirm/`, {
            method: 'POST',
        });
    },
};
// CHAT ENDPOINTS
export const chatAPI = {
    // GET /api/chat/token/<rental_id>/
    getFirebaseToken: async (rentalId) => {
        console.log(`📤 GET /api/chat/token/${rentalId}/`);
        console.log('🔥 Firebase custom token for rental:', rentalId);
        return apiRequest(`/api/chat/token/${rentalId}/`);
    },
};
// REVIEWS ENDPOINTS
export const reviewsAPI = {
    // POST /api/reviews/
    create: async (data) => {
        console.log('📤 POST /api/reviews/', data);
        return apiRequest('/api/reviews/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    // GET /api/reviews/?listing={id}
    getByListing: async (listingId) => {
        console.log(`📤 GET /api/reviews/?listing=${listingId}`);
        return apiRequest(`/api/reviews/?listing=${listingId}`);
    },
    // GET /api/reviews/?user={id}
    getByUser: async (userId) => {
        console.log(`📤 GET /api/reviews/?user=${userId}`);
        return apiRequest(`/api/reviews/?user=${userId}`);
    },
};
// PAYMENTS ENDPOINTS (Paymob Integration)
export const paymentsAPI = {
    // POST /api/payments/create-checkout/
    createCheckout: async (subscriptionTier) => {
        console.log('📤 POST /api/payments/create-checkout/', { subscriptionTier });
        console.log('💳 Paymob checkout (TEST MODE)');
        return apiRequest('/api/payments/create-checkout/', {
            method: 'POST',
            body: JSON.stringify({ subscription_tier: subscriptionTier }),
        });
    },
};
export default {
    auth: authAPI,
    listings: listingsAPI,
    rentals: rentalsAPI,
    chat: chatAPI,
    reviews: reviewsAPI,
    payments: paymentsAPI,
};
