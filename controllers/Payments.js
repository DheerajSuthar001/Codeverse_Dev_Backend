const { instance } = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const mongoose = require('mongoose');
const crypto = require('crypto')
const courseEnrollmentEmail=require('../mail/templates/courseEnrollmentEmail');
//Capture the payment
exports.capturePayment = async (req, res) => {

    const { courseId } = req.body;
    const userId = req.userData.id;
    if (!courseId) {
        return res.status(403).json({
            success: false,
            message: "Please provide valid Course Id"
        })
    }
    try {
        const courseData = await Course.findById(courseId);
        if (!courseData) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        };

        const uId = await mongoose.Types.ObjectId(userId);
        if (courseData.studentEnrolled.includes(uId)) {
            return res.status(200).json({
                success: false,
                message: "Student is already enrolled in this course "
            })
        }


    } catch (error) {
        console.log("Error in find the course", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify the course"
        })
    }

    const amount = courseData.price;
    const currency = 'INR';
    const option = {
        amount: amount,
        currency: currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: courseId,
            userId: userId
        }
    }
    try {
        const paymentResponse = await instance.orders.create(option);
        consosle.log(paymentResponse);

        return res.status(200).json({
            success: true,
            courseName: courseData.courseName,
            courseDescription: courseData.courseDescription,
            thumbnail: courseData.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount
        })
    } catch (error) {
        console.log("Error in creating order", error);
        return res.status(500).json({
            success: false,
            message: "Could not initiate order"
        })
    }
}

exports.verifySignature = async (req, res) => {
    const webhookSecret = "123456789";

    const signature = req.headers['x-razorpay-signature'];
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
        console.log("payment is authorized");

        const { courseId, userId } = req.body.payload.payment.entity.notes;

        try {
            const updatedCourseData = await Course.findByIdAndUpdate(courseId, {
                $push: {
                    studentEnrolled: userId
                }
            }, { new: true });
            if (!updatedCourseData) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                })
            };
            const updatedUserData = await User.findByIdAndUpdate(userId, {
                $push: {
                    courses: courseId
                }
            }, { new: true });
            if (!updatedUserData) {
                return res.status(500).json({
                    success: false,
                    message: "User not found"
                })
            };
            const courseName=await Course.findById(courseId,{courseName})
            const userName=await User.findById(userId,{firstName})
            const sentMail = await mailSender(
                updatedUserData.email, 
                "Congratulation from StudyNotion, you are onboarded into new course",
                courseEnrollmentEmail(courseName,userName));

            return res.status(200).json({
                success: true,
                message: "Signature verified and course enrolled successfully"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }

    }
    else {
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
}