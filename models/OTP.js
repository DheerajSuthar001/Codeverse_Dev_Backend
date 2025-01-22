const mongoose=require('mongoose');

const OTP=new mongoose.Schema({
   
    email:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    },
    otp:{
        type:Number,
        required:true
    }
})
module.exports=mongoose.model("OTP",OTP);  