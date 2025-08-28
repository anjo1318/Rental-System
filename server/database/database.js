import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER,
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST, 
        port: process.env.DB_PORT || 3307,
        dialect: process.env.DB_DIALECT || "mysql",
        dialectOptions: {
            connectTimeout: 30000,
            ssl:false
        },
        pool: {
            max: 5, 
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
);

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL connection is live");
    } catch (error) {
        console.error("Database connection failed");
        console.error(error);
        if (process.env.NODE_ENV !== 'production'){
            process.exit(1);
        }
    }
}


export {sequelize, connectToDatabase};
export default sequelize;