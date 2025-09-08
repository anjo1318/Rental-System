import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
   
    const navigate = useNavigate();

    console.log("Customers.jsx toooooo");


    return (
        <div>
            <h1>Customers</h1>
           
        </div>
    );
};

export default Customers;
