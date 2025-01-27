const   {instance}=require('../config/razorpay');
const Course=require('../models/Course');
const User=require('../models/User');
const mailSender=require('../utils/mailSender');
const {courseEnrollmentEmail}=require('../mail/templates/courseEnrollmentEmail');
const mongoose=require('mongoose');
//Capture the payment
exports.capturePayment=async (req,res)=>{

    const {courseId}=req.body;
    const userId=req.userData.id;
    if( !courseId){
        return res.status(403).json({
            success:false,
            message:"Please provide valid Course Id"
        })
    }
    try {
        const courseData=await Course.findById(courseId);
        if(!courseData){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        };

        const uId=await mongoose.Types.ObjectId(userId);
        if(courseData.studentEnrolled.includes(uId)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled in this course "
            })
        }


    } catch (error) {
        console.log("Error in find the course",error);
        return res.status(500).json({
            success:false,
            message:"Unable to verify the course"
        })
    }

    const amount=courseData.price;
    const currency='INR';
    const option={
        amount:amount,
        currency:currency,
        receipt:Math.random(Date.now()).toString();
    }
     



}