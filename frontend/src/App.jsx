// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/Dashboard/AdminDashboard";

function App() {
  return (
    <div>
      <Navbar />   {/* always visible */}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={< AdminDashboard/>} />
      </Routes>
    </div>
  );
}

export default App;
