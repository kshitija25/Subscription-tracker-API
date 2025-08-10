import mongoose from "mongoose";
import {DB_URI, NODE_ENV}   from "../config/env.js";

if(!DB_URI) {
    throw new Error("Please provide DB_URI environment variable insde .env.development/production.local");
}

const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB_URI);
        console.log('Connected to Database in ${NODE_ENV} mode');
    }
    catch(error){
        console.error('Error connecting to database',error);
        process.exit(1);
    }
}

export default connectToDatabase;