const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('pulsevote_token');
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
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => fetchAPI('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  googleAuth: (credential) => fetchAPI('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  getMe: () => fetchAPI('/api/auth/me'),

  // Polls
  createPoll: (pollData) => fetchAPI('/api/polls', { method: 'POST', body: JSON.stringify(pollData) }),
  getPollById: (id) => fetchAPI(`/api/polls/${id}`),
  getPollResults: (id) => fetchAPI(`/api/polls/${id}/results`),
  getMyPolls: () => fetchAPI('/api/polls/my'),
  votePoll: (id, optionId, voterId) => fetchAPI(`/api/polls/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId, voter_id: voterId }),
  }),
  closePoll: (id) => fetchAPI(`/api/polls/${id}/close`, { method: 'POST' }),
  deletePoll: (id) => fetchAPI(`/api/polls/${id}`, { method: 'DELETE' }),
};

export const getWebSocketURL = (pollId) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = API_BASE_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}//${host}/api/polls/${pollId}/live`;
};
