// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { path: "/home", label: "Home" },
    { path: "/admin-dashboard", label: "Dashboard" },
    { path: "/owners", label: "Owners" },
    { path: "/customers", label: "Customers" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <div className="h-screen w-60 bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">My App</h2>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`p-2 rounded-md hover:bg-gray-700 ${
              location.pathname === link.path ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
