const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('gazette_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred');
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => fetchAPI('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchAPI('/api/auth/me'),

  // Polls
  getPublicPolls: () => fetchAPI('/api/polls'),
  getPollById: (id) => fetchAPI(`/api/polls/${id}`),
  getMyPolls: () => fetchAPI('/api/polls/my'),
  createPoll: (pollData) => fetchAPI('/api/polls', { method: 'POST', body: JSON.stringify(pollData) }),
  votePoll: (id, optionId) => fetchAPI(`/api/polls/${id}/vote`, { method: 'POST', body: JSON.stringify({ option_id: optionId }) }),
  deletePoll: (id) => fetchAPI(`/api/polls/${id}`, { method: 'DELETE' }),
};

export const getWebSocketURL = (pollId) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  let host = API_BASE_URL ? API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '') : window.location.host;
  return `${wsProtocol}//${host}/ws/polls/${pollId}`;
};
