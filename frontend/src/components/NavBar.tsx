import {  FaTicketAlt,
  
  FaHome,
  FaPlusCircle,
  FaUserCog,
  FaPowerOff,
  FaListAlt, } from 'react-icons/fa'; 
import { useEffect,useState } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const profileImage = localStorage.getItem('profileImage') || '/vite.svg';

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);

      try {
        const decoded: any = jwtDecode(token);
        setUsername(decoded.username || decoded.name || "User");
        setRole(decoded.role || "user");
      } catch (err) {
        console.error("Failed to decode token", err);
        setUsername("User");
        setRole("user");
      }
    }
  }, []);

  

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token on logout
    setIsAuthenticated(false);
    navigate("/login"); // Redirect to login
    window.location.reload(); 
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 bg-green-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Center Logo */}
        <div className="flex-1 flex justify-center cursor-pointer">
          <Link to="/">
            <h1 className="text-2xl font-bold text-white">fastTix</h1>
          </Link>
        </div>

        {/* Right Sign In/Sign Out or Profile Icon */}
        {isAuthenticated ? (
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full border object-cover"
              onClick={toggleMenu}
            />

            {isMenuOpen && (
              <div className="w-64 bg-gray-800 text-white p-5 absolute right-0 mt-4 rounded-lg shadow-md z-10">
                <div className="text-xl mb-8">Welcome, {username}</div>
                <ul>
                  <li className="mb-4">
                    <Link to="/" className="flex items-center text-lg">
                      <FaHome className="mr-2" /> Home
                    </Link>
                  </li>

                  {role === "organizer" && (
                    <>
                      <li className="mb-4">
                        <Link to="/create-event" className="flex items-center text-lg">
                          <FaPlusCircle className="mr-2" /> Create Event
                        </Link>
                      </li>
                      <li className="mb-4">
                        <Link to="/dashboard/my-events" className="flex items-center text-lg">
                          <FaListAlt className="mr-2" /> My Events
                        </Link>
                      </li>
                    </>
                  )}

                  <li className="mb-4">
                    <Link to="/dashboard/events" className="flex items-center text-lg">
                      <FaTicketAlt className="mr-2" /> All Events
                    </Link>
                  </li>

                  <li className="mb-4">
                    <Link to="/dashboard/profile" className="flex items-center text-lg">
                      <FaUserCog className="mr-2" /> Profile Settings
                    </Link>
                  </li>

                  <li className="mb-4">
                    <Link to="/dashboard/profile" className="flex items-center text-lg">
                    <FaTicketAlt className="mr-2" /> My tickets
                    </Link>
                  </li>


                  <li>
                    <button className="flex items-center text-lg cursor-pointer" onClick={handleLogout}>
                      <FaPowerOff className="mr-2" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link
            className="flex items-center space-x-2 text-white cursor-pointer"
            to="/login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Sign In / Sign Up</span>
          </Link>
        )}
      </div>
    </nav>
    );
};

export default Navbar;
