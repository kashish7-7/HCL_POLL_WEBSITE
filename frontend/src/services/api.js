const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('pollnow_token') || localStorage.getItem('pulsevote_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error('Unable to connect to PollNow server. Please make sure the backend server is running and try again.');
  }

  const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => fetchAPI('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchAPI('/api/auth/me'),

  // Polls
  createPoll: (pollData) => fetchAPI('/api/polls', { method: 'POST', body: JSON.stringify(pollData) }),
  getPollById: (id) => fetchAPI(`/api/polls/${id}`),
  getPollResults: (id) => fetchAPI(`/api/polls/${id}/results`),
  getOwnerPollResults: (id) => fetchAPI(`/api/polls/${id}/owner-results`),
  getMyPolls: () => fetchAPI('/api/polls/my'),
  votePoll: (id, optionId, voterId) => fetchAPI(`/api/polls/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId, voter_id: voterId }),
  }),
  closePoll: (id) => fetchAPI(`/api/polls/${id}/close`, { method: 'POST' }),
  deletePoll: (id) => fetchAPI(`/api/polls/${id}`, { method: 'DELETE' }),
  exportResultsCSV: async (id, title = 'poll_results') => {
    const token = localStorage.getItem('pollnow_token') || localStorage.getItem('pulsevote_token');
    const response = await fetch(`${API_BASE_URL}/api/polls/${id}/results/export/csv`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(errData.error || 'Failed to export CSV');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  exportResultsExcel: async (id, title = 'poll_results') => {
    const token = localStorage.getItem('pollnow_token') || localStorage.getItem('pulsevote_token');
    const response = await fetch(`${API_BASE_URL}/api/polls/${id}/results/export/excel`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Export failed' }));
      throw new Error(errData.error || 'Failed to export Excel');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const getWebSocketURL = (pollId) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = API_BASE_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}//${host}/api/polls/${pollId}/live`;
};
