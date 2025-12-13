import { Link,  } from "react-router-dom";
import { useEffect, useState,  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../Context/AuthContext";
import { LogIn } from "lucide-react"; 

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
     {/*  Darker background for the entire page */}
     <div className="flex min-h-screen bg-gray-50 flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    {localStorage.getItem('redirectAfterLogin') &&(
    <div className="p-4 bg-blue-100 text-green-800 rounded mb-4 sm:mx-auto sm:w-full sm:max-w-md">
      Your session expired. Log in to continue where you left off.
    </div>
    )}
     
            {/* Increased max-width and added box styling */}
 <div className="sm:mx-auto sm:w-full sm:max-w-md p-8 bg-white shadow-2xl rounded-xl">
                {/* Logo/Branding Section */}
   <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
         </div>
   </div>

      <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
           Sign in to your  Account
     </h2>
                
                {/* Form starts here */}
             <form className="space-y-6 mt-8" onSubmit={handleLogin}>
           <div>
             <label
                htmlFor="identifier"
                  className="block text-sm  font-bold leading-6 text-gray-900"
                  >
                  Email or Username
                </label>
                   <div className="mt-2">
                     <input
                        id="identifier"
                         type="text"
                           className="block w-full rounded-md px-3 border-gray-300 border py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="block text-sm font-bold leading-6 text-gray-900"
                   >
                   Password
                   </label>
                    <div className="text-sm">
                      <Link to="/forgot-password" className="font-semibold text-gray-900 hover:text-green-500">
                      Forgot password?
                   </Link>
                </div>
                 </div>
                  <div className="mt-2">
                 <input
                    type="password"
                       className="block w-full px-3 rounded-md border-gray-300 border py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                       value={password} onChange={(e) => setPassword(e.target.value)} 
                       placeholder="Enter Password" required
                       />
                     </div>
                   </div>

                   <div>
                 <button
                     type="submit"
                      disabled={loadingLocal}
                      className={`flex w-full justify-center rounded-md px-3 py-2.5 text-base font-semibold leading-6 text-white shadow-md transition-all
                       ${loadingLocal ? 'bg-blue-600' : 'bg-gray-900 hover:bg-gray-700'} 
                      focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600`}>
                          {loadingLocal ? 'Signing in...' : 'Sign in'}
                     </button>
                     </div>
                      </form>

                   <p className="mt-6 text-center text-sm text-gray-900">
                       Don't have an account?{" "}
                    <Link
                        to="/register"
                      className="font-semibold leading-6 text-gray-900 hover:text-green-500"
                      >
                       Click here to register
                        </Link>
                       </p>
               </div>
            </div>
           </>
 )
}