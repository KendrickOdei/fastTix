import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  // Array of links for easier management
  const navigationLinks = [
    { title: 'Browse All Events', to: '/events' },
    { title: 'Event Categories', to: '/categories' },
    { title: 'My Tickets', to: '/my-tickets' },
    { title: 'Organizer Login', to: '/login?role=organizer' },
  ];

  const companyLinks = [
    { title: 'About fastTix', to: '/about' },
    { title: 'Partner Program', to: '/partner' },
    { title: 'Blog & Insights', to: '/blog' },
    { title: 'Careers', to: '/careers' },
  ];

  const supportLinks = [
    { title: 'Contact Support', to: '/contact' },
    { title: 'FAQs', to: '/faq' },
    { title: 'Accessibility', to: '/accessibility' },
    { title: 'Report an Issue', to: '/report' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 ">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Column 1: Logo & Mission Statement */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="text-3xl font-bold text-white mb-4 block">
              fastTix
            </Link>
            <p className="text-sm max-w-sm mb-6">
              Your seamless connection to local and global events. We make discovering and attending the best experiences simple and secure.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a href="#" aria-label="Follow us on Facebook" className="text-gray-400 hover:text-green-500 transition">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Follow us on Instagram" className="text-gray-400 hover:text-green-500 transition">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Follow us on X/Twitter" className="text-gray-400 hover:text-green-500 transition">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Follow us on LinkedIn" className="text-gray-400 hover:text-green-500 transition">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.title}>
                  <Link to={link.to} className="text-sm hover:text-white transition">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/*  Company */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.title}>
                  <Link to={link.to} className="text-sm hover:text-white transition">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/*  Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.title}>
                  <Link to={link.to} className="text-sm hover:text-white transition">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bo Copyright & Legal */}
        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="order-2 md:order-1 text-center md:text-left mt-4 md:mt-0">
            &copy; {new Date().getFullYear()} fastTix. All rights reserved.
          </p>
          <div className="order-1 md:order-2 flex space-x-6">
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/sitemap" className="hover:text-white transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;