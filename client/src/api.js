import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// // Auth
// export const devLogin   = (data) => api.post('/auth/dev-login', data);
// export const getMe      = ()     => api.get('/auth/me');

// // Memories
// export const getMemories    = ()       => api.get('/memories');
// export const uploadMemory   = (data)   => api.post('/memories/upload', data);
// export const deleteMemory   = (id)     => api.delete(`/memories/${id}`);

// // Nominees
// export const getNominees    = ()       => api.get('/nominees');
// export const addNominee     = (data)   => api.post('/nominees', data);
// export const updateNominee  = (id, d)  => api.patch(`/nominees/${id}`, d);
// export const deleteNominee  = (id)     => api.delete(`/nominees/${id}`);
// export const verifyNominee  = (id)     => api.patch(`/nominees/${id}/verify`);

// // Insurance
// export const linkPolicy     = (data)   => api.post('/insurance/link', data);
// export const getStatus      = ()       => api.get('/insurance/status');
// export const testTrigger    = ()       => api.post('/insurance/test-trigger');

export const devLogin = (data) => api.post('/api/auth/dev-login', data);
export const getMe = () => api.get('/api/auth/me');

export const getMemories = () => api.get('/api/memories');
export const uploadMemory = (data) => api.post('/api/memories/upload', data);
export const deleteMemory = (id) => api.delete(`/api/memories/${id}`);

export const getNominees = () => api.get('/api/nominees');
export const addNominee = (data) => api.post('/api/nominees', data);
export const updateNominee = (id, d) => api.patch(`/api/nominees/${id}`, d);
export const deleteNominee = (id) => api.delete(`/api/nominees/${id}`);
export const verifyNominee = (id) => api.patch(`/api/nominees/${id}/verify`);

export const linkPolicy = (data) => api.post('/api/insurance/link', data);
export const getStatus = () => api.get('/api/insurance/status');
export const testTrigger = () => api.post('/api/insurance/test-trigger');

export default api;