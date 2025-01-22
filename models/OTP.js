const mongoose=require('mongoose');
const mailSender=require('../utils/mailSender')
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
});

async function sendVerificationEmail(email,otp){
    try {
        const mailResponse=await mailSender(email,"Verification mail for StudyNotion",otp)
        console.log("OTP-mail sent successfully",mailResponse);
        
    } catch (error) {
        console.log("Error while sending otp",error);
    }
};
OTP.pre('save',async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports=mongoose.model("OTP",OTP);  