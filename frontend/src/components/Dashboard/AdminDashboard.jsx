import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    console.log("AdminDashboard.jsx loaded");

    const handleLogoutClick = () => {
        setShowConfirmation(true);
    };

    const handleLogout = () => {
        logout();
        setShowConfirmation(false);
        navigate("/");
    };

    const handleCancelLogout = () => {
        setShowConfirmation(false);
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            
            <div>
                <button 
                    onClick={handleLogoutClick}
                    className="bg-rose-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>

            {showConfirmation && (
                <div className="mt-4">
                    <p>Are you sure you want to log out?</p>
                    <button 
                        onClick={handleLogout} 
                        className="bg-green-500 text-white px-3 py-1 mr-2 rounded"
                    >
                        Yes
                    </button>
                    <button 
                        onClick={handleCancelLogout} 
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
