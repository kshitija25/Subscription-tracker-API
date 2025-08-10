import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {JWT_EXPIRES_IN, JWT_SECRET} from "../config/env.js";
export const signUp = async (req, res,next) => {

    const session= await mongoose.startSession();       //this session has nothing to do with the user session, its a session of mongoose transaction(atomic operation)
    session.startTransaction();
    try
    {
        //implement sign up logic
        const {name, email, password} = req.body;
        //check if user already exist
        const existingUser = await User.findOne({email});
        if (existingUser){
            const error=new Error("User already exists");
            error.statusCode=409;
            throw error;
        }
        //user does not exist-> hash the password for new user using bcrypt
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create([{name, email, password: hashedPassword}], {session});    //session if something goes wrong
        const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        //const token= jwt.sign({userId: newUser[0],_id}, JWT_SECRET, options:{expiresIn:JWT_EXPIRES_IN});

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            success:true,
            message:"Signed up successfully",
            data:{
                token,
                user:newUser[0],
            }
        });
    }
    catch(err){
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
}


export const signIn= async (req, res,next) => {
    //implement sign in logic
    try
    {
        const {email, password} = req.body;
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            const error = new Error("User not found, please sign up");
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password,existingUser.password);
        if (!isPasswordValid) {
            const error=new Error("Invalid Password");
            error.statusCode = 401;
            throw error;
        }
        const token= jwt.sign({ userId:existingUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            success:true,
            message:"Signed up successfully",
            data:{
                token,
                user:existingUser,
            }
        })

    }
    catch(err){
        next(err);
    }

}

export const signOut = async (req, res,next) => {
    //implement sign out logic
}