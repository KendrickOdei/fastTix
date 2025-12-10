

let navigateRef: any = null;
export const setNavigate = (navigateFn: any) => {
  navigateRef = navigateFn;
};

export const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (res.ok) return res.json();

  // NEVER logout/redirect from these
  const currentPath = window.location.pathname;
  const isProtectedPage = 
    currentPath.includes('/checkout') || 
    currentPath.includes('/guest-checkout') || 
    currentPath.includes('/payment-success');

  // If we're on a checkout or payment page never try refresh or redirect
  if (isProtectedPage) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText || 'Network error'}`);
  }

  // Only on normal pages do we try token refresh
  if (res.status === 401 && retryCount === 0) {
    try {
      const refreshed = await window.authRefreshToken();
      if (refreshed) {
        return apiFetch<T>(url, options, 1);
      }
    } catch (err) {
      // silent fail
    }
  }

  // Only logout & redirect on normal pages
  if (res.status === 401) {
    window.authLogout();
    localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    if (navigateRef) {
      navigateRef('/login');
    } else {
      window.location.href = '/login';
    }
    throw new Error("Session expired");
  }

  const errorText = await res.text();
  throw new Error(`Error ${res.status}: ${errorText}`);
};