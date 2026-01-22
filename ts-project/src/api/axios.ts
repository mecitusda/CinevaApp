import axios from 'axios';

console.log('API URL:', process.env.REACT_APP_API_URL); 
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // httpOnly cookie için ŞART
  timeout: 10000,
});

export default api;
