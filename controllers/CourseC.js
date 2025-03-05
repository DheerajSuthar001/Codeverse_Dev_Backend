const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const { uploadAsset } = require('../utils/AssetUploader');
const Section=require('../models/Section')
const SubSection=require('../models/SubSection')
const CourseProgress=require('../models/CourseProgress')
const  {convertSecondsToDuration}=require('../utils/secToDuration')
exports.createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, price, category, tags, whatYouWillLearn,instructions } = req.body;
        let {status}=req.body;
        // console.log('data fro course',req.body);
        // console.log('data fro course',req.files);
        const thumbnail = req.files.thumbnailImage;

        //validations
        if (!courseName || !courseDescription || !price || !category  || !instructions|| !whatYouWillLearn || !thumbnail || !tags) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        if(!status || status==undefined){
            status="Draft";
        }
        //find instructor details
        const id = req.userData.id;
        const instructorData = await User.findOne({
            _id:id,
            accountType:"Instructor"
        });

        if (!instructorData)
            return res.status(404).json({
                status: false,
                message: "Instructor Details not found"
            })
        const checkCategoryExists = await Category.findById(category);
        if (!checkCategoryExists) {
            return res.status(404).json({
                success: false,
                message: "Invalid Category"
            })
        }
        //Upload image
        const thumbnailInfo = await uploadAsset(thumbnail, process.env.FOLDER_NAME);
        //create a course in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: id,
            whatYouWillLearn,
            price,
            tags,
            thumbnail: thumbnailInfo.secure_url,
            category,
            status,
            instructions
        })
        //adding course to the instructor's courses
        await User.findByIdAndUpdate(
            id,
            {
                $push: {
                    courses: newCourse._id
                }
            },
        )
        //adding new course to Category
        await Category.findByIdAndUpdate(
            checkCategoryExists._id,
            {
                $push: {
                    courses: newCourse._id
                }
            }
        )
         res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        })
    } catch (error) {
        console.log("Error while creating course", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating course"
        })
    }
};
exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadAsset(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReview")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSections",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
  exports.getAllCourses = async (req, res) => {
    try {
      const allCourses = await Course.find(
        { status: "Published" },
        {
          courseName: true,
          price: true,
          thumbnail: true,
          instructor: true,
          ratingAndReview: true,
          studentEnrolled: true,
        }
      )
        .populate("instructor")
        .exec()
  
      return res.status(200).json({
        success: true,
        data: allCourses,
      })
    } catch (error) {
      console.log(error)
      return res.status(404).json({
        success: false,
        message: `Can't Fetch Course Data`,
        error: error.message,
      })
    }
  }

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const courseDetails = await Course.findOne({
          _id: courseId,
        })
          .populate({
            path: "instructor",
            populate: {
              path: "additionalDetails",
            },
          })
          .populate("category")
          .populate("ratingAndReview")
          .populate({
            path: "courseContent",
            populate: {
              path: "subSections",
              select: "-videoUrl",
            },
          })
          .exec()
    
        if (!courseDetails) {
          return res.status(400).json({
            success: false,
            message: `Could not find course with id: ${courseId}`,
          })
        }
    
        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }
    
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
          content.subSections.forEach((subSection) => {
            const timeDurationInSeconds = parseInt(subSection.timeDuration)
            totalDurationInSeconds += timeDurationInSeconds
          })
        })
    
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
    
        return res.status(200).json({
          success: true,
          data: {
            courseDetails,
            totalDuration,
          },
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        })
      }
}
exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.userData.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReview")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSections",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSections.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.userData.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSections
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }