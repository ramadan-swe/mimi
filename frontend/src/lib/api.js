/**
 * API Integration Layer using Axios
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create Axios Instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

function forceLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
}


// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Token Refresh Logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};


// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
    (response) => response.data,

    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (originalRequest.skipAuth) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // Prevent infinite loops
        if (originalRequest._retry) {
            return Promise.reject(error);
        }
        // If refresh already in progress, queue the request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    },
                    reject
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            isRefreshing = false;
            forceLogout();
            return Promise.reject(error);
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/token/refresh/`,
                { refresh: refreshToken }
            );

            const newAccessToken = response.data.access;

            localStorage.setItem('access_token', newAccessToken);
            api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            forceLogout();
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);


// AUTHENTICATION ENDPOINTS
export const authAPI = {
    // POST /api/auth/register/
    register: async (data) => {
        return api.post('/api/auth/register/', data, { skipAuth: true });
    },
    // POST /api/auth/token/
    login: async (email, password) => {
        const response = await api.post('/api/auth/token/', { email, password }, { skipAuth: true });
        // Token storage is handled in AuthContext or component
        return response;
    },
    // GET /api/auth/profile/
    getProfile: async () => {
        return api.get('/api/auth/profile/');
    },
    // PATCH /api/auth/profile/
    updateProfile: async (data) => {
        return api.patch('/api/auth/profile/', data);
    },
    // POST /api/auth/password-reset/
    requestPasswordReset: async (email) => {
        return api.post('/api/auth/password-reset/', { email }, { skipAuth: true });
    },
    // POST /api/auth/password-reset-confirm/
    confirmPasswordReset: async (uid, token, new_password) => {
        return api.post('/api/auth/password-reset-confirm/', { uid, token, new_password }, { skipAuth: true });
    },
    // POST /api/auth/verify-phone/
    sendWhatsAppOTP: async (phone_number) => {
        return api.post('/api/auth/verify-phone/', { phone_number });
    },
    // POST /api/auth/confirm-otp/
    confirmOTP: async (phone_number, otp_code) => {
        return api.post('/api/auth/confirm-otp/', { phone_number, otp_code });
    },
    // POST /api/auth/veriff/create-session/
    createVeriffSession: async () => {
        return api.post('/api/auth/veriff/create-session/');
    },
    // GET /api/auth/verify-identity/ - Get verification status
    getVerificationStatus: async () => {
        return api.get('/api/auth/verify-identity/');
    },
    // POST /api/auth/verify-identity/ - Submit ID verification documents
    submitVerification: async (formData) => {
        return api.post('/api/auth/verify-identity/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    // POST /api/auth/upload-id/ (Legacy - Fallback for manual verification)
    uploadID: async (formData) => {
        return api.post('/api/auth/verify-identity/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

// LISTINGS ENDPOINTS
export const listingsAPI = {
    // GET /api/listings/
    getAll: async (params) => {
        return api.get('/api/listings/', { params });
    },
    // GET /api/listings/search/
    search: async (params) => {
        // Use the main listings endpoint with search parameter
        return api.get('/api/listings/', { params: { search: params.q, ...params } });
    },
    // GET /api/listings/explore/?q=... for AI semantic search
    aiSearch: async (prompt) => {
        return api.get('/api/listings/explore/', { params: { q: prompt } });
    },
    // POST /api/listings/
    create: async (data) => {
        return api.post('/api/listings/', data);
    },
    // GET /api/listings/{id}/
    getById: async (id) => {
        return api.get(`/api/listings/${id}/`);
    },
    // PUT /api/listings/{id}/
    update: async (id, data) => {
        return api.put(`/api/listings/${id}/`, data);
    },
    // DELETE /api/listings/{id}/
    delete: async (id) => {
        return api.delete(`/api/listings/${id}/`);
    },
    // GET /api/listings/{id}/availability/unavailable-dates/
    getUnavailableDates: async (listingId) => {
        return api.get(`/api/listings/${listingId}/availability/unavailable-dates/`);
    },
    // POST /api/listings/{id}/upload_image/
    uploadImage: async (listingId, formData) => {
        // Remove Content-Type header and transformRequest to let browser handle FormData properly
        return api.post(`/api/listings/${listingId}/upload_image/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: [(data) => data], // Don't transform FormData
        });
    },
};

// RENTALS ENDPOINTS
export const rentalsAPI = {
    // POST /api/listings/rentals/
    createRequest: async (data) => {
        return api.post('/api/listings/rentals/', data);
    },
    // GET /api/listings/rentals/ - Get user's rental requests (as renter)
    getMyRequests: async () => {
        return api.get('/api/listings/rentals/');
    },
    // GET /api/listings/rentals/incoming/ - Get incoming requests (as owner)
    getIncoming: async () => {
        return api.get('/api/listings/rentals/incoming/');
    },
    // POST /api/listings/rentals/{id}/accept/
    accept: async (id) => {
        return api.post(`/api/listings/rentals/${id}/accept/`);
    },
    // POST /api/listings/rentals/{id}/reject/
    reject: async (id) => {
        return api.post(`/api/listings/rentals/${id}/reject/`);
    },
    // POST /api/listings/rentals/{id}/cancel/
    cancel: async (id) => {
        return api.post(`/api/listings/rentals/${id}/cancel/`);
    },
    // GET /api/listings/rentals/pending_count/ - Get count of pending rental requests for owner
    getPendingCount: async () => {
        return api.get('/api/listings/rentals/pending_count/');
    },
};

// CHAT ENDPOINTS
export const chatAPI = {
    // GET /api/chat/token/<rental_id>/
    getFirebaseToken: async (rentalId) => {
        return api.get(`/api/chat/token/${rentalId}/`);
    },
};

// REVIEWS ENDPOINTS
export const reviewsAPI = {
    // POST /api/reviews/
    create: async (data) => {
        return api.post('/api/listings/reviews/', data);
    },
    // GET /api/reviews/?listing={id}
    getByListing: async (listingId) => {
        return api.get('/api/listings/reviews/', { params: { listing: listingId } });
    },
    // GET /api/reviews/?user={id}
    getByUser: async (userId) => {
        return api.get('/api/listings/reviews/', { params: { user: userId } });
    },
};

// PAYMENTS ENDPOINTS (Paymob Integration)
export const paymentsAPI = {
    // 1. Updated endpoint and key name (plan_id)
    createCheckout: async (planId) => {
        return api.post('api/payments/subscribe/', { plan_id: planId });
    },
    // 2. Updated to match router.register(r'plans', ...)
    getSubscriptions: async () => {
        return api.get('api/payments/plans/');
    },
    getTransactions: async () => {
        return api.get('api/payments/transactions/');
    },
    verifyPayment: async (transactionId) => {
        return api.get(`api/payments/verify/${transactionId}/`);
    },
    getCurrentSubscription: async () => {
        return api.get('api/payments/subscription/current/');
    },
    // 3. Updated to use the unified manage endpoint
    cancelSubscription: async () => {
        return api.post('api/payments/manage/', { action: 'cancel' });
    },
};

// USERS ENDPOINTS
export const usersAPI = {
    // GET /api/users/{id}/ - Public user profile
    getById: async (userId) => {
        return api.get(`/api/users/${userId}/`);
    },
};

export default {
    auth: authAPI,
    listings: listingsAPI,
    rentals: rentalsAPI,
    chat: chatAPI,
    reviews: reviewsAPI,
    payments: paymentsAPI,
    users: usersAPI,
};