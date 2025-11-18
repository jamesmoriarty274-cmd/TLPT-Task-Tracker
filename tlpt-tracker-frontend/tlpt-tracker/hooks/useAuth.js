import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            localStorage.setItem('token', response.token);
            setUser(response.user);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const success = await authService.changePassword(currentPassword, newPassword);
            return success;
        } catch (error) {
            console.error('Password change failed:', error);
            throw error;
        }
    };

    return {
        user,
        loading,
        login,
        logout,
        changePassword
    };
};
