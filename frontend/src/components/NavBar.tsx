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

interface Event {
    _id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    category: string; // Ensure category is expected
}

interface suggestInterface {
    
    results: Event[];
}

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
  const [suggestions, setSuggestions] = useState<Event[]>([]);
const [isSearching, setIsSearching] = useState(false);


 useEffect(() => {
  const fetchSuggestions = async () => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${baseUrl}/api/events?q=${searchTerm}`);
      const data: suggestInterface = await response.json();

     if (data && data.results) {
            setSuggestions(data.results.slice(0, 5)); 
        } else {
            setSuggestions([]);
        } 
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const timer = setTimeout(fetchSuggestions, 300); // Debounce 300ms
  return () => clearTimeout(timer);
}, [searchTerm]);
 

  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSearch(false);
      setSuggestions([]); 
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSuggestions([]);
        setSearchTerm("");

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
    <nav className=" relative w-full  top-0 left-0 right-0 z-50 bg-gray-900 p-4 shadow-md items-center">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-white">
            fastTix
          </Link>
        </div>

      {showSearch && (
      <div className="absolute inset-0 bg-gray-900 z-[60] flex items-center justify-center px-4 animate-in fade-in slide-in-from-top-2 duration-300">
       <div className="max-w-3xl w-full flex items-center gap-4 relative" ref={searchRef}>
      
      {/* Search Input Wrapper */}
      <div className="flex-1 relative">
          <button 
              onClick={handleSearch}
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors z-10"
            >
              <FaSearch />
            </button> 

        <form onSubmit={handleSearch}>
          <input
            id="event-search" 
            name="q"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events, artists, or venues..."
            className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-lg"
            autoFocus
          />
        </form>

        {(suggestions.length > 0 || isSearching) && (
          <div className="absolute top-[110%] left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[70] min-w-[300px]">
            {isSearching && (
              <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                Searching for "{searchTerm}"...
              </div>
            )}
            
            {!isSearching && suggestions.map((event) => (
              <Link
                id={`input-${event._id}`} 
                key={event._id}
                to={`/event-details/${event._id}`}
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm("");
                  setSuggestions([]);
                }}
                className="flex items-center gap-4 p-3 hover:bg-green-50 transition-colors border-b last:border-0"
              >
                <img 
                  src={event.image || '/placeholder.jpg'} 
                  alt="" 
                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{event.title}</span>
                  <span className="text-xs text-gray-500">{event.venue}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => {
          setShowSearch(false);
          setSearchTerm("");
          setSuggestions([]);
        }}
        className="text-gray-400 hover:text-white transition-transform hover:scale-110"
      >
        <FaTimes size={24} />
      </button>
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

             {role === 'admin' && (
              <>
                <Link to="admin/dashboard" className="hover:text-gray-300 flex items-center">
                  Admin Dashboard
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

      {role === 'admin' && (
         <>
        <Link
         to="admin/dashboard" 
         onClick={toggleMenu}
         className="flex items-center hover:bg-white/10 text-white font-bold px-4 py-4 rounded-xl transition-all">
            Admin Dashboard
         </Link>

                
         </>
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
