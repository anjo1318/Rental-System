import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const Owners = () => {
   
    const navigate = useNavigate();

    console.log("Owners.jsx toooooo");


    return (
        <div>
            <h1>Owners</h1>
           
        </div>
    );
};

export default Owners;
