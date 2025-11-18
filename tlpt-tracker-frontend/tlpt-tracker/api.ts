const API_BASE_URL = 'http://localhost:5000/api';

// Add token to requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// API functions for real backend
export const api = {
  // Auth
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

	// Create User (for admin)
	async createUser(userData) {
	  console.log('🔄 Creating user with data:', userData);
	  
	  const response = await fetch(`${API_BASE_URL}/auth/register`, {
	    method: 'POST',
	    headers: getAuthHeaders(),
	    body: JSON.stringify(userData),
	  });
	  
	  console.log('📡 Response status:', response.status);
	  const result = await response.json();
	  console.log('📨 Response data:', result);
	  
	  return result;
	},

  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Projects
  async getProjects() {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createProject(projectData) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return response.json();
  },

  async getProject(id) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Tasks
  async getProjectTasks(projectId) {
    const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return response.json();
  },

  async startTaskTimer(taskId, subIndex, subSubIndex) {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/subtasks/${subIndex}/${subSubIndex}/start`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  async stopTaskTimer(taskId, subIndex, subSubIndex, data) {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/subtasks/${subIndex}/${subSubIndex}/stop`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  async markTaskNotApplicable(taskId, subIndex, subSubIndex, notes) {
    const response = await fetch(
      `${API_BASE_URL}/tasks/${taskId}/subtasks/${subIndex}/${subSubIndex}/not-applicable`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      }
    );
    return response.json();
  },

  // Users
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Delete User
  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Data Management
  async exportAllData() {
    const response = await fetch(`${API_BASE_URL}/data/export`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async importAllData(data) {
    const response = await fetch(`${API_BASE_URL}/data/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data }),
    });
    return response.json();
  },

  async resetAllData() {
    const response = await fetch(`${API_BASE_URL}/data/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  }
};
