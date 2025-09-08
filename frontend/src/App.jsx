// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import Sidebar from "./components/Sidebar";
import Home from "./components/Dashboard/Home";
import Owners from "./components/Dashboard/Owners";
import Customers from "./components/Dashboard/Customers";
import Settings from "./components/Dashboard/Settings";

function App() {
  return (
    <div>
      <Sidebar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={< AdminDashboard/>} />
        <Route path="/home" element={< Home/>} />
        <Route path="/owners" element={< Owners/>} />
        <Route path="/customers" element={< Customers/>} />
        <Route path="/settings" element={< Settings/>} />
      </Routes>
    </div>
  );
}

export default App;
