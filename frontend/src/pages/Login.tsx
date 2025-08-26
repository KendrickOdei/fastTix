
import { Link,  } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";

interface DecodedToken{
  userId: string;
  email: string;
  userName: string;
  role: 'user' | 'organizer';

}

interface loginData {
  email: string;
  userName: string;
  password: string;
}

const loginDataObj: loginData = {
  email: '',
  userName: '',
  password: '',
}

export default function Login () {

  const [loginDetails, setLoginDetails] = useState(loginDataObj);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        // Validate token using /validate-token
        await apiFetch<{ userId: string; role: string }>('/api/auth/validate-token', {
          method: 'GET',
          credentials: 'include', 
        });
        navigate('/');
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (checkingAuth) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const  value = e.target.value;
    setLoginDetails((prev)=> ({...prev,
      email: value.includes('@')? value : '',
      userName: !value.includes('@')? value : '',
    
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch<{ 
        accessToken: string ;
        refreshToken: string ;
        message: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          credentials: 'include', // Include cookies for refreshToken
          body: JSON.stringify({ email: loginDetails.email.trim() ||  loginDetails.userName, password: password.trim() }),
        }
      );

       localStorage.setItem('token', response.accessToken);
      const decode: DecodedToken = jwtDecode(response.accessToken);
      toast.success(`Welcome ${decode.userName || decode.email}`);
      navigate('/');
      window.location.reload()
      
    } catch (error: any) {
      toast.error(error.message || 'login failed')
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 
  

    return (
        <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email or Username
                </label>
                <div className="mt-2">
                  <input
                    id="identifier"
                    type="text"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={loginDetails.email || loginDetails.userName}
                    onChange={handleChange}
                     
                    placeholder="Enter Email or Username"
                    required
                  />
                </div>
              </div>

  
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                  <Link to="/forgot-password" className="font-semibold text-green-600 hover:text-green-500">
                    Forgot password?
                 </Link>

                    
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="password"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" required
                  />
                  
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm
                    ${loading ? 'bg-blue-600' : 'bg-green-900 hover:bg-green-700'} 
                    focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600`}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
  
            <p className="mt-10 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold leading-6 text-green-900 hover:text-green-500"
              >
                Click here to register
              </Link>
            </p>
          </div>
        </div>
      </>
    )
}