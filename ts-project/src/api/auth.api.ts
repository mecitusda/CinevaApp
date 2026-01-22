import api from "./axios";

/* LOGIN */
export async function login(payload: {
  email: string;
  password: string;
}) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

/* REGISTER */
export async function register(payload: {
  username: string;
  email: string;
  password: string;
}) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

/* LOGOUT */
export async function logout() {
  const { data } = await api.post("/auth/logout");
  return data;
}

/* ME */
export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function getMylist() {
  const { data } = await api.get("/auth/me/mylist");
  return data
}