import api from './axios';

export async function uploadAvatar(file: File) {
  const fd = new FormData();
  fd.append('avatar', file);

  const { data } = await api.post('/profile/avatar', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}

export async function getProfileStats() {
  const { data } = await api.get('/profile');
  return data;
}
