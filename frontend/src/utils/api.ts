
export const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Add for cookie support
  });

  if (res.status === 401 && retryCount === 0) {
    try {
      const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const { accessToken } = await refreshResponse.json();
      localStorage.setItem('token', accessToken);

      return apiFetch<T>(url, options, 1);
    } catch (error) {
      localStorage.removeItem('token');
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

// export const apiFetch = async <T = any>(
//     url: string,
//     options: RequestInit = {}
//   ): Promise<T> => {
//     const token = localStorage.getItem('token');
  
//     const res = await fetch(url, {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers, // allow overrides
//       },
//     });
  
//     if (res.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//       throw new Error('Unauthorized'); 
//     }
  
//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(`Error ${res.status}: ${errorText}`);
//     }
  
//     return res.json() as Promise<T>;
//   };
  








// export const apiFetch = async (url: string, options: RequestInit = {}) => {
//     const token = localStorage.getItem('token');
  
//     const headers = {
//       ...(options.headers || {}),
//       Authorization: token ? `Bearer ${token}` : '',
//       'Content-Type': 'application/json',
//     };
  
//     const response = await fetch(url, {
//       ...options,
//       headers,
//     });
  
//     if (response.status === 401) {
//       // Unauthorized, token might be expired
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//       return;
//     }
  
//     return response;
//   };
  