import api from './axios';

export async function getHome() {
  const start = performance.now();
  const { data } = await api.get('/home').then((data) => {
    console.log("Süre:", performance.now() - start, "ms");
    return data;
  });
  return data;
}
