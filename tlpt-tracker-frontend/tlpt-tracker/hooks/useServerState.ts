import { useState, useEffect } from 'react';
import { api } from './../api';  // Try this instead

export function useServerState<T>(endpoint: string, initialValue: T) {
    const [data, setData] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let response;
                
                if (endpoint === 'users') {
                    response = await api.getUsers();
                } else if (endpoint === 'projects') {
                    response = await api.getProjects();
                } else if (endpoint === 'tasks') {
                    // Use projects endpoint as fallback for now
                    response = await api.getProjects();
                } else {
                    throw new Error(`Unknown endpoint: ${endpoint}`);
                }

                if (response.success) {
                    setData(response[endpoint] || response.data || response);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, setData };
}
