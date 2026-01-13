import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser as setReduxUser, clearUser, setLoading } from '../store/slices/authSlice';
import { authAPI } from '../lib/api';
import { decodeJWT } from '../lib/jwt';
import { toast } from 'sonner';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        dispatch(clearUser());
    }, [dispatch]);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('access_token');
        if (token) {
            const user = decodeJWT(token);
            if (user) {
                dispatch(setReduxUser(user));
            } else {
                logout();
            }
        } else {
            dispatch(setLoading(false));
        }

        // Listen for auth:unauthorized events
        const handleUnauthorized = () => {
            logout();
            navigate('/login');
            toast.error('Session expired. Please login again.');
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [navigate, dispatch, logout]);
    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);

            const user = decodeJWT(response.access);
            dispatch(setReduxUser(user));
            return user;
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw error;
        }
    };
    const register = async (data) => {
        await authAPI.register(data);
        // After registration, user should verify phone before logging in
    };
    const updateUser = (updatedUser) => {
        dispatch(setReduxUser(updatedUser));
    };
    return (<AuthContext.Provider value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        updateUser,
    }}>
        {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
