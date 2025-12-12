import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState,  } from "react";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      <MobileDrawer open={open} setOpen={setOpen} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <Topbar onMenuClick={() => setOpen(true)} />

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
          
        </main>

      </div>
    </div>
  );
}

function MobileDrawer({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div
      className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setOpen(false)}
    >
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl p-4 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Sidebar isMobile />
        
      </div>
    </div>
  );
}