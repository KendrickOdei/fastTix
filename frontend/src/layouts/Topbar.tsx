import { Menu, Bell, User } from "lucide-react";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      
      {/* Mobile menu button */}
      <button className="md:hidden" onClick={onMenuClick}>
        <Menu size={28} />
      </button>

      {/* Title */}
      <h2 className="text-lg font-semibold hidden md:block">Dashboard</h2>

      {/* Right icons */}
      <div className="flex items-center gap-5">
        <Bell size={22} />
        <User size={22} />
      </div>
    </header>
  );
}