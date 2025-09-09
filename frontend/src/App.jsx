// App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import Sidebar from "./components/Sidebar";
import Home from "./components/Dashboard/Home";
import Owners from "./components/Dashboard/Owners";
import Customers from "./components/Dashboard/Customers";
import Settings from "./components/Dashboard/Settings";
import Approvals from "./components/Dashboard/Approvals";

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <div className="flex">
      {/* Sidebar stays fixed on all pages except login */}
      {!hideSidebar && <Sidebar />}

      {/* Content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/approvals" element={<Approvals />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
