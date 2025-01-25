const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const { imageUploader } = require('../utils/imageUploader');

exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, price, category,tags, whatYouWillLearn } = req.body;
        const thumbnail = req.files.thumbnailImage;

        //validations
        if (!courseName || !courseDescription || !price || !category || !whatYouWillLearn || !thumbnail ||!tags) {
            res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }
        //find instructor details
        const id = req.userData.id;
        // const instructorData = await User.findById(id);

        // if (!instructorData)
        //     return res.status(404).json({
        //         status: false,
        //         message: "Instructor not found"
        //     })
        const checkCategoryExists = await Category.findById(category);
        if (!checkCategoryExists) {
            return res.status(404).json({
                success: false,
                message: "Invalid Category"
            })
        }
        //Upload image
        const thumbnailInfo = await imageUploader(File, process.env.FOLDER_NAME);
        //create a course in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: id,
            whatYouWillLearn,
            price,
            tags,
            thumbnail: thumbnailInfo.secure_url,
            Category: checkCategoryExists._id
        })
        //adding course to the instructor's courses
        await User.findByIdAndUpdate(
            id,
            {$push:{
                courses:newCourse._id
            }},
        )
        //adding new course to Category
        await Category.findByIdAndUpdate(
            checkCategoryExists._id,
            {
                $push:{
                    courses:newCourse._id
                }
            }
        )
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse
        })
    } catch (error) {
        console.log("Error while creating course",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating course"
        })
    }
};
exports.getAllCourses=async (req,res)=>{
    try {
        const allCourses=await Course.find({},{courseName:true,price:true,thumbnail:true,instructor:true,ratingAndReview:true,studentEnrolled:true,tags:true}).populate().exec();

        return res.status(200).json({
            success:true,
            message:"Fetched all courses successfully",
            courses:allCourses
        })

    } catch (error) {
        console.log("Error while fetching all courses",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while getting all courses data"
        })
    }
}