// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const hideOnRoutes = ["/", "/login"];

  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { path: "/dashboard", label: "Users" },
    { path: "/drivers", label: "Drivers" },
    { path: "/admin", label: "Admin" },
    { path: "/location", label: "Location" },
    { path: "/stats", label: "Stats" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/images/swifht.png"
            alt="SWIFHT Logo"
            className="h-8 w-8 object-contain"
          />
          <h1 className="text-xl font-bold tracking-wide">SWIFHT</h1>
        </div>

        {/* Nav Links */}
        <ul className="flex gap-4 sm:gap-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                  ${
                    location.pathname === item.path
                      ? "bg-white text-pink-600 shadow-md"
                      : "hover:bg-pink-600 hover:shadow"
                  }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
