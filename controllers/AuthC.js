const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt=require('jsonwebtoken');
const {mailSender}=require('../utils/mailSender');
require('dotenv').config();
const {passwordUpdated}=require('../mail/templates/passowrdUpdated')
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(403).json({
                success: false,
                message: "Invalid email format"
            })
        }
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User Already registered"
            })
        }

        let otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        let checkOtpExists = await OTP.findOne({ otp });
        while (checkOtpExists) {
            otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
            checkOtpExists = await OTP.findOne({ otp });
        }
        const otpObject=new OTP({
            email,
            otp
        });
        const otpBody = await otpObject.save();

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        })

    } catch (error) {
        console.log("Error while sending otp", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send OTP"
        })
    }

};
exports.signUp = async (req, res) => {
    try {
        const {
            firstName
            , lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(403).json({
                success: false,
                message: "Invalid email format"
            })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirmPassword does not match"
            })
        }

        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            })
        }
        const latestOtp = await OTP.find({ email:email }).sort({ createdAt: -1 }).limit(1);
        
       
        if (latestOtp.length == 0) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Otp not found"
                }
            )
        }
        else if (latestOtp[0].otp != otp) {
            return res.status(400).json({
                success: false,
                message: "Otp is not valid"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`

        })
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to register"
        })
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "All fields are required. PLease try again"
            })
        }
        if (!emailRegex.test(email)) {
            return res.status(403).json({
                success: false,
                message: "Invalid email format"
            })
        }
        const userData=await User.findOne({email}).populate('additionalDetails').exec();
        if(!userData){
            return res.status(400).json({
                success:false,
                message:"User is not registered with us. Please sign up"
            })
        };
        const payLoad={
            id:userData._id,
            email,
            accountType:userData.accountType
        }
        if(await bcrypt.compare(password,userData.password)){
            const token=jwt.sign(payLoad,process.env.JWT_SECRET,{expiresIn:"24h"})
            userData.token=token;
            userData.password=undefined;
            res.cookie("token",token,{
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }).status(200).json({
                success:true,
                token,
                userData,
                message:"Logged in successfully"
            })
        }
        else{
            res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }

       
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure, please try again"
        })
    }

}
exports.changePassword=async (req,res)=>{
    try {
    
        //get all data needed
        const { oldPassword, newPassword } = req.body;
    //Other ways to get email either through authorization header or cookie

    //data validation
    if(!oldPassword || !newPassword ){
        return res.status(403).json({
            success:false,
            message:"All fields are required.Please try again"
        })
    }
    
   
    const userData=await User.findById({_id:req.userData.id});
        if(!userData){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        };
    
    if(!await bcrypt.compare(oldPassword,userData.password)){
        return res.status(403).json({
            sucess:false,
            message:"Old password does not match!"
        })
    }
    //hashing the password
    const hashedNewPassword=await bcrypt.hash(newPassword,10);
    //db entry

    const updatedPassword= await User.findByIdAndUpdate({_id:req.userData.id},{password:hashedNewPassword},{new:true});
    //send email

    const info= await mailSender(
        userData.email,
        `PassWord updated successfully got ${userData.firstName} ${userData.lastName}`, 
        passwordUpdated(userData.email,userData.firstName));

    //send response
    res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })
    } catch (error) {
        console.log("Error while changing password",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while changing password"
        })
    }
}

