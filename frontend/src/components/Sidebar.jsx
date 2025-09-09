// src/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const links = [
    { path: "/home", label: "Home" },
    { path: "/admin-dashboard", label: "Dashboard" },
    { path: "/owners", label: "Owners" },
    { path: "/customers", label: "Customers" },
    { path: "/settings", label: "Settings" },
    { path: "/approvals", label: "Approvals" },
  ];

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleLogout = () => {
    logout();
    setShowConfirmation(false);
    navigate("/");
  };

  return (
    <div className="h-screen w-60 bg-gray-800 text-white flex flex-col p-4 justify-between">
      {/* Top links */}
      <div>
        <h2 className="text-xl font-bold mb-6">EzRent</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`p-2 rounded-md hover:bg-gray-700 ${
                location.pathname === link.path
                  ? "bg-gray-700 font-semibold"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom logout */}
      <div>
        <button
          onClick={handleLogoutClick}
          className="w-full bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
        >
          Logout
        </button>

        {showConfirmation && (
          <div className="mt-4 bg-gray-700 p-3 rounded">
            <p className="mb-2">Are you sure you want to log out?</p>
            <button
              onClick={handleLogout}
              className="bg-green-500 text-white px-3 py-1 mr-2 rounded"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
