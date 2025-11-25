
import { Link,  } from "react-router-dom";
import { useEffect, useState,  } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from "../Context/AuthContext";



export default function Login () {

  const [identifier, setIdentifier] = useState('')

  const [password, setPassword] = useState('');

  const [loadingLocal, setLoadingLocal] = useState(false);

  const navigate = useNavigate();

  const {user, login} = useAuth()

  const isAuthenticated = !!user

  useEffect(()=> {
    if(isAuthenticated){
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/organizer'
      localStorage.removeItem('redirectAfterLogin')
      navigate(redirectTo, {replace: true})
    }
  },[isAuthenticated, navigate])

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault()
    setLoadingLocal(true)

    try {
      await login(identifier.trim(),password.trim())
      
    } catch (error: any) {
      console.error(error)
      
    } finally{
      setLoadingLocal(false)
    }
  }

    return (
        <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          {localStorage.getItem('redirectAfterLogin') &&(
            <div className="p-4 bg-blue-100 text-green-800 rounded mb-4">
                Your session expired. Log in to continue where you left off.
            </div>
          )}
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
                    value={identifier}
                    onChange={(e)=> setIdentifier(e.target.value)}
                     
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
                  disabled={loadingLocal}
                  className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm
                    ${loadingLocal ? 'bg-blue-600' : 'bg-green-900 hover:bg-green-700'} 
                    focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600`}>
                  {loadingLocal ? 'Signing in...' : 'Sign in'}
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