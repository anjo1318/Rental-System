import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
   
    const navigate = useNavigate();

    console.log("Settings.jsx toooooo");


    return (
       <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
      {/* Header Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
          Setting Dashboard
        </h1>
      </div>
    </div>
    );
};

export default Settings;