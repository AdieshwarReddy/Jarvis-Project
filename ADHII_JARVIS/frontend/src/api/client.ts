const DEFAULT_HOST = typeof window !== 'undefined' && window.location ? window.location.hostname || '127.0.0.1' : '127.0.0.1';
const BASE_URL = import.meta.env.VITE_API_URL || `http://${DEFAULT_HOST}:8000`;

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('jarvis_token') || 'demo-token';
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.message || errorJson.detail || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

// -------------------------------------------------------------
// API SERVICES
// -------------------------------------------------------------
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (data: { email: string; password: string; display_name: string }) =>
    fetchApi('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (data?: { email?: string; name?: string }) =>
    fetchApi('/api/auth/google', { method: 'POST', body: JSON.stringify(data || {}) }),
  getMe: () => fetchApi('/api/auth/me'),
  logout: () => fetchApi('/api/auth/logout', { method: 'POST' }),
};

export const voiceApi = {
  synthesize: (text: string, voice?: string) =>
    fetchApi<{ status: string; audio: string; format: string }>('/api/voice/tts', {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
    }),
};

export const conversationsApi = {
  list: () => fetchApi('/api/conversations'),
  create: (title: string = 'New Conversation') =>
    fetchApi('/api/conversations', { method: 'POST', body: JSON.stringify({ title }) }),
  get: (id: string) => fetchApi(`/api/conversations/${id}`),
  update: (id: string, updates: { title?: string; summary?: string }) =>
    fetchApi(`/api/conversations/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (id: string) => fetchApi(`/api/conversations/${id}`, { method: 'DELETE' }),
  sendMessage: (id: string, content: string) =>
    fetchApi(`/api/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role: 'user', content }),
    }),
};

export const documentsApi = {
  list: () => fetchApi('/api/documents'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi('/api/documents/upload', { method: 'POST', body: formData });
  },
  get: (id: string) => fetchApi(`/api/documents/${id}`),
  delete: (id: string) => fetchApi(`/api/documents/${id}`, { method: 'DELETE' }),
  ask: (id: string, question: string) =>
    fetchApi(`/api/documents/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
};

export const notesApi = {
  list: (query?: string) => fetchApi(`/api/notes${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  create: (note: { title: string; content: string }) =>
    fetchApi('/api/notes', { method: 'POST', body: JSON.stringify(note) }),
  update: (id: string, updates: { title?: string; content?: string }) =>
    fetchApi(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (id: string) => fetchApi(`/api/notes/${id}`, { method: 'DELETE' }),
};

export const tasksApi = {
  list: (status?: string) => fetchApi(`/api/tasks${status ? `?status=${status}` : ''}`),
  create: (task: { title: string; description?: string; priority?: string; due_at?: string }) =>
    fetchApi('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id: string, updates: any) =>
    fetchApi(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  delete: (id: string) => fetchApi(`/api/tasks/${id}`, { method: 'DELETE' }),
};

export const remindersApi = {
  list: () => fetchApi('/api/reminders'),
  create: (reminder: { title: string; reminder_at: string }) =>
    fetchApi('/api/reminders', { method: 'POST', body: JSON.stringify(reminder) }),
  delete: (id: string) => fetchApi(`/api/reminders/${id}`, { method: 'DELETE' }),
};

export const toolsApi = {
  list: () => fetchApi('/api/tools'),
  calculate: (expression: string) =>
    fetchApi('/api/tools/calculate', { method: 'POST', body: JSON.stringify({ expression }) }),
  datetime: (timezone?: string) =>
    fetchApi('/api/tools/datetime', { method: 'POST', body: JSON.stringify({ timezone }) }),
  weather: (location: string) =>
    fetchApi('/api/tools/weather', { method: 'POST', body: JSON.stringify({ location }) }),
  search: (query: string) =>
    fetchApi('/api/tools/search', { method: 'POST', body: JSON.stringify({ query }) }),
  confirm: (tool_activity_id: string, confirmed: boolean) =>
    fetchApi('/api/tools/confirm', { method: 'POST', body: JSON.stringify({ tool_activity_id, confirmed }) }),
};

export const settingsApi = {
  getProfile: () => fetchApi('/api/profile'),
  updateProfile: (profile: any) =>
    fetchApi('/api/profile', { method: 'PATCH', body: JSON.stringify(profile) }),
  getMemories: () => fetchApi('/api/memories'),
  createMemory: (memory: { memory_type: string; content: string; importance: number }) =>
    fetchApi('/api/memories', { method: 'POST', body: JSON.stringify(memory) }),
  deleteMemory: (id: string) => fetchApi(`/api/memories/${id}`, { method: 'DELETE' }),
  getToolActivity: () => fetchApi('/api/tool-activity'),
  getNotifications: () => fetchApi('/api/notifications'),
  markNotificationsRead: () => fetchApi('/api/notifications/read', { method: 'POST' }),
};
