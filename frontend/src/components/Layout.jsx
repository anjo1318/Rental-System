// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";

const Layout = () => {
  const location = useLocation();
  
  // Check if current path is /home or / (case-insensitive)
  const isHomePage = location.pathname === "/" || location.pathname.toLowerCase() === "/home";

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        {isHomePage && <Topbar />}
        
        <main className="p-6">
          <Outlet /> {/* <- renders Home, Dashboard, Owners, etc. */}
        </main>
      </div>
    </div>
  );
};

export default Layout;