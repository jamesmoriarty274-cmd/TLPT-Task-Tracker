import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authService = {
    changePassword: async (currentPassword, newPassword) => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 changePassword token:', token);
            
            const response = await axios.put(
                `${API_BASE_URL}/auth/change-password`,
                { currentPassword, newPassword },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data; // ← This returns {success: true, message: '...'}
        } catch (error) {
            console.error('🔍 Password change error:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Token is not valid');
        }
    },

    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 getCurrentUser token:', token); // Debug token
            
            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.user;
        } catch (error) {
            console.error('🔍 Get user error:', error);
            throw error;
        }
    },

    login: async (email, password) => {
        try {
            console.log('🔍 authService.login called with:', { email, password });
            
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username: email,
                password
            });
            
            console.log('🔍 authService.login response:', response.data);
            
            // Store the token properly
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('🔍 Token stored:', response.data.token);
            }
            
            return response.data;
        } catch (error) {
            console.error('🔍 authService.login error:', error);
            throw error;
        }
    }
};

export default authService;
