const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

exports.addRatingAndReview = async (req, res) => {
    try {
        const { rating, review, courseId } = req.body;
        const userId = req.userData.id;

        if (!rating || !review || userId || !courseId)
            return res.status(403).json({
                sucess: false,
                message: "All properties are required"
            });

        const checkUserEnrolled = await course.findOne({
            _id: courseId,
            studentEnrolled: { $elementMatch: { $eq: userId } }
        });
        if (!checkUserEnrolled) {
            return res.status(200).json({
                success: false,
                message: "Student is not enrolled in this course"
            })
        }
        const checkUserReviewed = await RatingAndReview.findOne({
            course: courseId,
            user: userId
        });
        if (checkUserReviewed) {
            return res.status(200).json({
                success: false,
                message: "Student already reviewed and rated the course"
            })
        }
        const ratingAndReviewData = await RatingAndReview.create({ user: userId, course: courseId, rating, review });
        const updatedCourseData = await Course.findByIdAndUpdate(courseId, {
            $push: {
                ratingAndReview: ratingAndReviewData._id
            }
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully"
        })
    } catch (error) {
        console.log("Error while creating rating and review", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating rating and review"
        })
    }
}
exports.getAverageRating = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId)
            return res.status(403).json({
                success: false,
                message: "All properties are required"
            })
        const rating = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Schema.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{
                        $avg:"$rating"
                    }
                }
            }
        ]);
        if(rating.length>0){
            return res.status(200).json({
                success:true,
                averageRating:rating[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            averageRating:0,
            message:"Average rating is 0. No rating given till now "
        })

    } catch (error) {
        console.log("Error while getting average rating", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting average rating"
        })
    }
}
exports.getAllRatings=async (req,res)=>{
    try {
        const {courseId}=req.body;
        if (!courseId)
            return res.status(403).json({
                success: false,
                message: "All properties are required"
            })
        const allRatings=await RatingAndReview.find({course:courseId});
        if(!allRatings){
            return res.status(404).json({
                success:false,
                message:"No rating or reviews found"
            })
        }
        return res.status(200).json({
            success:true,
            allRatings
        })
    } catch (error) {
        console.log("Error while getting all ratings", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting all ratings"
        })
    }
}