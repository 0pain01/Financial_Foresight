const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const getBaseUrl = () => {
  return 'http://localhost:8080';
};

export const api = {
  get: async (url: string) => {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (url: string, data: any) => {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  put: async (url: string, data: any) => {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  delete: async (url: string) => {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};