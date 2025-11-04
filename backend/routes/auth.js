const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register",async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        const existUser=await User.findOne({email});
        if(existUser){
            return res.status(400).json({message:"User already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({name,email,password:hashedPassword});
        await user.save();
        res.status(201).json({message:"User registered successfully"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
        
    }
});

router.post("/login",async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid password"});
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
        res.status(200).json({token});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
        
    }
});

module.exports=router;



