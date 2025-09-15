// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  UserSquare,
  Settings,
  LogOut,
} from "lucide-react"; // icons

const Sidebar = () => {
  const location = useLocation();

  // Hide Sidebar on login or landing page
  const hideOnRoutes = ["/", "/login"];
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { path: "/home", label: "Home", icon: <Home size={18} /> },
    { path: "/admin-dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/owners", label: "Owners", icon: <Users size={18} /> },
    { path: "/customers", label: "Customers", icon: <UserSquare size={18} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  // 🔐 Logout handler
  const handleLogout = () => {
    // Example: clear token and redirect
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Load Poppins without touching index.css */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <aside
        className="fixed top-0 left-0 h-full w-64 shadow-lg z-50 flex flex-col justify-between"
        style={{ backgroundColor: "#007F7F", fontFamily: "Poppins, sans-serif" }}
      >
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-0 px-6 py-4 border-b border-teal-700">
            <img
              src="/EzRent_Logo.png"
              alt="EzRent Logo"
              className="h-16 w-16 object-contain"
            />
            <h1 className="text-3xl font-bold tracking-wide text-white">EzRent</h1>
          </div>

          {/* Nav Links */}
          <nav className="mt-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300
                      ${
                        location.pathname === item.path
                          ? "bg-white text-[#007F7F] shadow-md"
                          : "text-white hover:bg-[#009999]"
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Section (Logout Button) */}
        <div className="px-6 py-4 border-t border-teal-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-all duration-300"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;