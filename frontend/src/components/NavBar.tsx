import {
  FaHome,
  FaPowerOff,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { useEffect, useState ,useRef} from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { toast } from 'react-toastify';
import { useAuth } from '../Context/AuthContext';



const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user, logout} = useAuth();
  const isAuthenticated = !!user
  const role = user?.role;
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("")

  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null);
 

  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSearch(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);



  const handleLogout = async () => {
    try {
      logout();
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error: any) {
      toast.error('Failed to log out.');
    }
  };

  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);



// this logic closes the menu when you click anywhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="w-full  top-0 left-0 right-0 z-50 bg-gray-900 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            fastTix
          </Link>
        </div>

        {showSearch && (
            <div className="fixed top-0 inset-0 bg-transparent z-50 flex items-start justify-center px-4 pt-24">
              <div
                ref={searchRef}
                className="bg-white rounded-md w-full max-w-xl p-4 shadow-md relative animate-slideInLeft"
              >
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                  <FaTimes />
                </button>
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for events..."
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600 text-black"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="text-white bg-green-600 hover:bg-green-700 p-2 rounded"
                  >
                    <FaSearch />
                  </button>
                </form>
              </div>
            </div>
          )}

        {/* Desktop Menu */}
        
        
          <div className="hidden md:flex items-center space-x-6 text-white font-semibold">
            <Link to="/" className="hover:text-gray-300 flex items-center">
              <FaHome className="mr-2" /> Home
            </Link>

            <Link to="/events" className="hover:text-gray-300 flex items-center">
               Discover Events
            </Link>
            <Link to={isAuthenticated ? "organizer/dashboard" : "/register"} className="hover:text-gray-300 flex items-center">
               Sell Tickets
            </Link>

            {role === 'organizer' && (
              <>
                <Link to="organizer/dashboard" className="hover:text-gray-300 flex items-center">
                  My Dashboard
                </Link>

                
              </>
            )}

           </div>
          
           {isAuthenticated ?(
          <div className='hidden md:flex text-white font-semibold gap-6'>
            <button onClick={() => setShowSearch(true)} className="text-xl hover:text-gray-300">
             <FaSearch />
          </button>

          
           <button
           onClick={handleLogout}
           className="flex items-center space-x-2 hover:text-gray-300"
         >
           <FaPowerOff className="mr-2" /> Logout
         </button>
         </div>

        ) : (
          <div className="hidden md:flex text-white font-semibold gap-4">
            <button onClick={() => setShowSearch(true)} className="text-xl hover:text-gray-300">
             <FaSearch />
          </button>
          <Link to="/login" className="flex items-center space-x-2 hover:text-gray-300">
         
            <span>Sign In / Sign Up</span>
          </Link>
        </div>

        )
        
        }
         
        

        
{/* Mobile Menu Wrapper  */}
<div ref={menuRef} className="md:hidden flex gap-6 items-center">
  {/* Search Icon */}
  <button 
    onClick={() => setShowSearch(true)} 
    className="text-white text-xl focus:outline-none"
  >
    <FaSearch />
  </button>

  {/* Hamburger Toggle */}
  <button onClick={toggleMenu} className="text-white">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  </button>

  {/* Backdrop Overlay  */}
  {/* This dims the rest of the screen when the menu is open */}
  <div 
    className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
      isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
    onClick={toggleMenu}
  />

  {/*  Side Drawer  */}
  <div 
    className={`fixed top-0 right-0 h-screen w-[280px] bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
      isMenuOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    {/* Close Button Inside Drawer */}
    <div className="flex justify-end p-5">
      <button onClick={toggleMenu} className="text-gray-400 font-bold hover:text-white">
         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
         </svg>
      </button>
    </div>

    {/* Menu Links */}
    <ul className="flex flex-col gap-2 px-4 text-lg">
      <li>
        <Link
          to="/"
          onClick={toggleMenu}
          className="flex items-center hover:bg-white/10 text-white font-bold px-4 py-4 rounded-xl transition-all"
        >
          <FaHome className="mr-4 text-green-500" /> Home
        </Link>
      </li>

      <li>
        <Link
          to="/events"
          onClick={toggleMenu}
          className="flex items-center hover:bg-white/10 text-white font-bold px-4 py-4 rounded-xl transition-all"
        >
          <div className="w-5 h-5 mr-4 flex items-center justify-center">✨</div>
          Discover Events
        </Link>
      </li>

      <li>
        <Link 
          to={isAuthenticated ? "/organizer/dashboard" : "/register"} 
          onClick={toggleMenu}
          className="flex items-center hover:bg-white/10 text-white font-bold px-4 py-4 rounded-xl transition-all"
        >
          <div className="w-5 h-5 mr-4 flex items-center justify-center">🎟️</div>
          Sell Tickets
        </Link>
      </li>

      {role === 'organizer' && (
        <li>
          <Link
            to="/organizer"
            onClick={toggleMenu}
            className="flex items-center hover:bg-white/10 text-white font-bold px-4 py-4 rounded-xl transition-all"
          >
            <div className="w-5 h-5 mr-4 flex items-center justify-center">📊</div>
            My Dashboard
          </Link>
        </li>
      )}

      {/* Divider */}
      <hr className="border-gray-800 my-4 mx-4" />

      <li>
        {isAuthenticated ? (
          <button
            onClick={() => { handleLogout(); toggleMenu(); }}
            className="w-full text-left flex items-center text-red-400 font-bold hover:bg-red-500/10 px-4 py-4 rounded-xl transition-all"
          >
            <FaPowerOff className="mr-4" /> Logout
          </button>
        ) : (
          <Link
            to="/login"
            onClick={toggleMenu}
            className="flex items-center bg-green-700  text-white px-4 py-4 rounded-xl transition-all justify-center font-bold"
          >
            Sign In / Sign Up
          </Link>
        )}
            </li>
          </ul>
        </div>
      </div>

      </div>
    </nav>
  );
};

export default Navbar;
