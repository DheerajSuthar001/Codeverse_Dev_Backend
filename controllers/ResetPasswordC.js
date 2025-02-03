const User=require('../models/User')
const {mailSender}=require('../utils/mailSender')
const cryto=require('crypto');
const bcrypt=require('bcrypt')

exports.resetPasswordToken=async (req,res)=>{
    try {
        //get email from req body
    const {email}=req.body;
    //check user in db
    const userData=await User.findOne({email});
    if(!userData){
        return res.status(404).json({
            success:false,
            message:"Your email is not registered with us"
        })
    }
    //generate token
    const token=cryto.randomUUID();
    //update user with token and resetpasswordexpiry
    const updatesUser=await User.findOneAndUpdate(
        {email},
        {token:token,resetPasswordExpires:Date.now() + 5*60*1000},
        {new:true}
    );
    //send Mail
    const url=`http://localhost:3000/update-password/${token}`;
    const info=await mailSender(email,"Password Reset Link",`Password reset link : ${url}`);

    return res.status(200).json({
        success:true,
        message:"Email sent successfully, please check email and change password"
    })
    } catch (error) {
        console.log("error while reseting password",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while generating passowrd reset link"
        })
    }
};
exports.resetPassword=async(req,res)=>{
    try {
        const {password,confirmPassword,token}=req.body;
        if(!token || !password || !confirmPassword ){
            return res.status(403).json({
                success:false,
                message:"All fields are required.Please try again"
            })
        }
        
        if(password!==confirmPassword){
            return res.status(403).json({
                success:false,
                message:"Passwords do not match"
            })
        }
        const userData=await User.findOne({token:token});
        if(!userData){
            return res.status(403).json({
                success:false,
                message:"Token is invalid"
            })
        }
        if(userData.resetPasswordExpires<Date.now()){
            return res.status(400).json({
                success:false,
                message:"token expired! Please regenerate token"
            })
        }
        //create hashed password
        const hashedPassword=await bcrypt.hash(password,10);
        //update in db
        await User.findOneAndUpdate({token:token},{password:hashedPassword})
        return res.status(200).json({
            success:true,
            message:"Password reset successfull"
        })

    } catch (error) {
        console.log("Error in reseting password",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while reseting password"
        })
    }
}