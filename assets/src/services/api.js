const API_BASE = '/wp-json/company-hub/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('company_hub_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('company_hub_token');
      window.location.reload();
    }
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return { data: await handleResponse(response) };
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return { data: await handleResponse(response) };
  },

  put: async (endpoint, data) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return { data: await handleResponse(response) };
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return { data: await handleResponse(response) };
  }
};

export default api;