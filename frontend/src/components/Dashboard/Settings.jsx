import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
   
    const navigate = useNavigate();

    console.log("Settings.jsx toooooo");


    return (
        <div>
            <h1>Settings</h1>
           
        </div>
    );
};

export default Settings;
