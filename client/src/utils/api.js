// In production, use relative URL (same domain). In dev, use localhost
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

/**
 * Make authenticated API request
 */
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('dj_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email, password) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// Events API
export const eventsAPI = {
  getAll: () => fetchWithAuth('/events'),

  create: (eventData) =>
    fetchWithAuth('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  getBySlug: (slug) =>
    fetch(`${API_BASE_URL}/events/${slug}`).then(r => r.json()),

  update: (slug, updates) =>
    fetchWithAuth(`/events/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  end: (slug) =>
    fetchWithAuth(`/events/${slug}/end`, {
      method: 'POST',
    }),

  getAnalytics: (slug) =>
    fetchWithAuth(`/events/${slug}/analytics`),
};

// Requests API
export const requestsAPI = {
  getForEvent: (slug) =>
    fetch(`${API_BASE_URL}/events/${slug}/requests`).then(r => r.json()),

  submit: (slug, requestData) =>
    fetch(`${API_BASE_URL}/events/${slug}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }).then(r => r.json()),

  upvote: (requestId, sessionId) =>
    fetch(`${API_BASE_URL}/requests/${requestId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    }).then(r => r.json()),

  updateStatus: (requestId, status) =>
    fetchWithAuth(`/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Blocklist API
export const blocklistAPI = {
  getAll: () => fetchWithAuth('/blocklist'),

  add: (songPattern) =>
    fetchWithAuth('/blocklist', {
      method: 'POST',
      body: JSON.stringify({ song_pattern: songPattern }),
    }),

  remove: (id) =>
    fetchWithAuth(`/blocklist/${id}`, {
      method: 'DELETE',
    }),
};
