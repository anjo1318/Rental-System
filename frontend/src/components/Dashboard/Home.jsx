import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
   
    const navigate = useNavigate();

    console.log("Home.jsx toooooo");


    return (
        <div>
            <h1>Home</h1>
           
        </div>
    );
};

export default Home;
