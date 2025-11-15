import { useAuth } from "../Context/AuthContext";
export const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const {  refreshToken, logout} = useAuth()
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Add for cookie support
  });
  // if accessToken expired, try refreshing
  if (res.status === 401 && retryCount === 0) {
    try {
      await refreshToken()

      return apiFetch<T>(url, options, 1);
    } catch (error) {
      logout()
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<T>;
};
