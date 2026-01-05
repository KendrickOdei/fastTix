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

  // Define checkout/payment pages that should NEVER auto-logout
  const currentPath = window.location.pathname;
  const isCheckoutPage =
    currentPath.includes('/checkout') ||
    currentPath.includes('/guest-checkout') ||
    currentPath.includes('/payment-success');

  // If we're on checkout/payment, just throw error without redirect
  if (isCheckoutPage) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText || 'Network error'}`);
  }

  // For ALL other pages (including admin), try token refresh on 401
  if (res.status === 401 && retryCount === 0) {
    console.log('🔄 Got 401, attempting token refresh...');
    try {
      const refreshed = await window.authRefreshToken();
      if (refreshed) {
        console.log('✅ Token refreshed, retrying request...');
        return apiFetch<T>(url, options, 1);
      }
    } catch (err) {
      console.warn("❌ Token refresh failed:", err);
    }
  }

  // If still 401 after refresh attempt, logout and redirect
  if (res.status === 401) {
    console.log('🚪 Session expired, logging out...');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Save where they were trying to go
    localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    
    // Call the global logout handler
    if (window.authLogout) {
      window.authLogout();
    }
    
    // Navigate to login
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