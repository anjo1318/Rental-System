// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import Home from "./components/Dashboard/Home";
import Owners from "./components/Dashboard/Owners";
import Customers from "./components/Dashboard/Customers";
import Settings from "./components/Dashboard/Settings";
import Approvals from "./components/Dashboard/Approvals";

function App() {
  return (
    <div className="flex">
      <Routes>
        {/* Login has no sidebar/layout */}
        <Route path="/"login element={<Login />} />

        {/* All other pages inside Layout */}
        <Route element={<Layout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/approvals" element={<Approvals />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
