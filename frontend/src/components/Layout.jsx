// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";

const Layout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        <main className="p-6">
          <Outlet /> {/* <- renders Home, Dashboard, Owners, etc. */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
