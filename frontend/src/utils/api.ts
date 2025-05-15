// // utils/api.ts
export const apiFetch = async <T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token = localStorage.getItem('token');
  
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers, // allow overrides
      },
    });
  
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized'); 
    }
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
  
    return res.json() as Promise<T>;
  };
  








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
  