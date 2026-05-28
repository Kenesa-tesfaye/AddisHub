import api from './api';

// Signup
export async function signup(name, email, password) {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data; // { token, user }
}

// Login
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // { token, user }
}

// Update user
export async function updateUser(id, data) {
  const response = await api.put(`/auth/${id}`, data);
  return response.data;
}

// Change password
export async function changePassword(id, currentPassword, newPassword) {
  const response = await api.post(`/auth/${id}/change-password`, {
    currentPassword,
    newPassword
  });
  return response.data;
}

// Delete user
export async function deleteUser(id) {
  const response = await api.delete(`/auth/${id}`);
  return response.data;
}
export async function getUser(id) {
  const response = await api.get(`/auth/${id}`);
  return response.data;
}
export async function getUserById(id) {
  const response = await api.get(`/auth/${id}`);
  return response.data;
}

export async function getResourcesByUser(userId) {
  const response = await api.get(`/resources`, { params: { userId } });
  return response.data;
}

export async function getEventsByUser(userId) {
  const response = await api.get(`/events`, { params: { userId } });
  return response.data;
}

export async function getAllUsers(search = '') {
  const response = await api.get('/auth/all/search', { params: { search } });
  return response.data;
}
