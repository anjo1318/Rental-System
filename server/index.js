import express from 'express'; 
import dotenv from 'dotenv';
import { connectToDatabase } from './database/database.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`port ${PORT} is running`);
});



connectToDatabase();
    
    
