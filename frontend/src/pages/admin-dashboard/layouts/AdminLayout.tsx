import { Outlet } from "react-router-dom";
import AdminSidebar from "./adminSidebar";
import AdminNavbar from "./adminNavbar";
import { useState } from "react";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (desktop) */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <div className="fixed w-64 h-full">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <MobileDrawer open={open} setOpen={setOpen} />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <AdminNavbar onMenuClick={() => setOpen(true)} />

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MobileDrawer({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />
      
      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 md:hidden transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <AdminSidebar isMobile onClose={() => setOpen(false)} />
      </div>
    </>
  );
}