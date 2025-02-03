const jwt=require('jsonwebtoken');
require('dotenv').config();
const User=require('../models/User');
exports.auth= async(req,res,next)=>{
    try {
        //GEtting the token either through cookies or authorisation bearrer header
        const token=req?.header("Authorization")?.replace("Bearer","")|| req.cookies.token;
        //checking tkoen exists
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Authorization token not found"
            })
        }
        //verify the token

        try {
            const decoded= jwt.verify(token, process.env.JWT_SECRET); 
            req.userData=decoded;
            console.log(decoded);
        } catch (error) {
            console.log(error);
            return res.status(403).json({
                success:false,
                message:"token not valid"
            })
        }
        
        next();
    } catch (error) {
        console.log("Error in authorization token",error);
        res.status(403).json({
            success:false,
            message:"Something went wrong while validating token"
        })
    }
}
exports.isStudent=async (req,res,next)=>{
    try {
        const {accountType}=req.userData;
        if(accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"Unauthorized access : This is protected route for student"
            })
        }

       
        next();
    } catch (error) {
        console.log("Error in autorization",error);
        res.status(403).json({
            success:false,
            message:"Could not authorize user's role"
        })
    }
}
exports.isInstructor=async (req,res,next)=>{
    try {
        const {accountType}=req.userData;
        if(accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"Unauthorized access : This is protected route for instructor"
            })
        }

       
        next();
    } catch (error) {
        console.log("Error in autorization",error);
        res.status(403).json({
            success:false,
            message:"Could not authorize user's role"
        })
    }
}
exports.isAdmin=async (req,res,next)=>{
    try {
        
        const {accountType}=req.userData;
        if(accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"Unauthorized access : This is protected route for instructor"
            })
        }

        next();
    } catch (error) {
        console.log("Error in autorization",error);
        res.status(403).json({
            success:false,
            message:"Could not authorize user's role"
        })
    }
}