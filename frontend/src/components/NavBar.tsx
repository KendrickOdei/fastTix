import {
  FaTicketAlt,
  FaHome,
  FaPlusCircle,
  FaUserCog,
  FaPowerOff,
  FaListAlt,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { useEffect, useState ,useRef} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
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





  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      try {
        const decoded: any = jwtDecode(token);
        setUsername(decoded.username || decoded.name || 'User');
        setRole(decoded.role || 'user');
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }
  }, []);





  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
    window.location.reload();
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);




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
    <nav className="w-full  top-0 left-0 right-0 z-50 bg-green-800 p-4 shadow-md">
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

            {role === 'organizer' && (
              <>
                <Link to="/create-event" className="hover:text-gray-300 flex items-center">
                  <FaPlusCircle className="mr-2" /> Create Event
                </Link>

                <Link to="/my-events" className="hover:text-gray-300 flex items-center">
                  <FaListAlt className="mr-2" /> My Events
                </Link>
              </>
            )}

            <Link to="/dashboard/events" className="hover:text-gray-300 flex items-center">
              <FaTicketAlt className="mr-2" /> All Events
            </Link>

            

            <Link to="/dashboard/profile" className="hover:text-gray-300 flex items-center">
              <FaTicketAlt className="mr-2" /> My Tickets
            </Link>

            

            
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
            <FaUserCog className="w-5 h-5" />
            <span>Sign In / Sign Up</span>
          </Link>
        </div>

        )
        
        }
         
        

        {/* Mobile Menu Icon */}
        <div ref={menuRef} className="md:hidden relative flex gap-6">
        <button onClick={() => setShowSearch(true)} className="text-white text-xl md:text-2xl ml-4 focus:outline-none">
          <FaSearch />
        </button>
        <div onClick={toggleMenu}>

        <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24" fill="currentColor"
          className="size-8 text-white font-bold">
        <path fillRule="evenodd" 
        d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm8.25 5.25a.75.75 0 0 1 .75-.75h8.25a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>

        </div>

       

          {/* <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border cursor-pointer"
            
          /> */}
          

          {/* Mobile Dropdown */}
          {isMenuOpen && (
            <div  className="absolute right-0 mt-3 w-64 bg-gray-800 text-white p-5 rounded-md shadow-lg z-50">
              <div className="text-lg mb-4">Welcome, {username}</div>
              <ul className="space-y-4">
                <li>
                  <Link to="/" className="flex items-center" onClick={toggleMenu}>
                    <FaHome className="mr-2" /> Home
                  </Link>
                </li>

                {role === 'organizer' && (
                  <>
                    <li>
                      <Link to="/create-event" className="flex items-center" onClick={toggleMenu}>
                        <FaPlusCircle className="mr-2" /> Create Event
                      </Link>
                    </li>
                    <li>
                      <Link to="/my-events" className="flex items-center" onClick={toggleMenu}>
                        <FaListAlt className="mr-2" /> My Events
                      </Link>
                    </li>
                  </>
                )}

                <li>
                  <Link to="/dashboard/events" className="flex items-center" onClick={toggleMenu}>
                    <FaTicketAlt className="mr-2" /> All Events
                  </Link>
                </li>

                <li>
                  <Link to="/dashboard/profile" className="flex items-center" onClick={toggleMenu}>
                    <FaUserCog className="mr-2" /> Profile
                  </Link>
                </li>

                <li>
                  <Link to="/dashboard/profile" className="flex items-center" onClick={toggleMenu}>
                    <FaTicketAlt className="mr-2" /> My Tickets
                  </Link>
                </li>

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-400 hover:text-red-300"
                  >
                    <FaPowerOff className="mr-2" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
