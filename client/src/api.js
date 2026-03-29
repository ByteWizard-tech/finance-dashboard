const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const get = (url) => api(url);
export const post = (url, body) => api(url, { method: 'POST', body: JSON.stringify(body) });
export const del = (url) => api(url, { method: 'DELETE' });
