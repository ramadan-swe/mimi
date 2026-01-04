import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('access_token');
        if (token) {
            // In real app, fetch user data from /api/auth/me/ or similar
            const mockUser = {
                id: '1',
                email: 'john.doe@example.com',
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '+201234567890',
                phone_verified: true,
                is_verified_identity: true,
                role: 'HOST',
                waseet_score: 85,
            };
            setUser(mockUser);
        }
        setIsLoading(false);
    }, []);
    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        setUser(response.user);
    };
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };
    const register = async (data) => {
        await authAPI.register(data);
        // After registration, user should verify phone before logging in
    };
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };
    return (<AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
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
