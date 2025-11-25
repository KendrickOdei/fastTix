import { NavLink } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Ticket,
  BarChart3,
  Calendar,
  Settings,
} from "lucide-react";

export default function Sidebar({ isMobile }: { isMobile?: boolean }) {
  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200";

  return (
    <aside
      className={`bg-white border-r border-gray-200 ${isMobile ? 'block' : 'hidden md:block'} `}
    >
      {/* Logo */}
      <h1 className="text-xl font-bold mb-6">fastTix Organizer</h1>

      {/* Links */}
      <nav className="flex flex-col gap-2">
        <NavLink className={linkClass} to="/organizer" end>
          <Home size={20} /> Overview
        </NavLink>

        <NavLink className={linkClass} to="/organizer/create-event">
          <PlusCircle size={20} /> Create Event
        </NavLink>

        <NavLink className={linkClass} to="/organizer/my-events">
          <Ticket size={20} /> Create Ticket
        </NavLink>

        <NavLink className={linkClass} to="/organizer/my-events">
          <Calendar size={20} /> My Events
        </NavLink>

        <NavLink className={linkClass} to="/organizer/sales">
          <BarChart3 size={20} /> Sales & Reports
        </NavLink>

        <NavLink className={linkClass} to="/organizer/settings">
          <Settings size={20} /> Settings
        </NavLink>
      </nav>
    </aside>
  );
}