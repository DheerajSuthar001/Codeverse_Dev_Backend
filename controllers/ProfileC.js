const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');
const CourseProgress=require('../models/CourseProgress')
const { uploadAsset } = require('../utils/AssetUploader');
const {convertSecondsToDuration}=require('../utils/secToDuration')
exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender="" } = req.body;
        const userId = req.userData.id;
        
        const Userdetail = await User.findById(userId);
        const profileId = Userdetail.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        const updatedUserDetails = await User.findById(userId)
        .populate('additionalDetails')
        .exec();

        await profileDetails.save();
        return res.status(200).json({
            success: true,
            message: "Profile details updated successfully",
            data:updatedUserDetails
        })
    } catch (error) {
        console.log("Error in updating profile");
        res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile"
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.userData.id;

        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const profileId = userDetails.additionalDetails._id;
        await Profile.findByIdAndDelete(profileId);
        await Course.updateMany({ studentEnrolled: id }, {
            $pull: {
                studentEnrolled: id
            }
        })
        await User.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.log("Error in deleting user");
        res.status(500).json({
            success: false,
            message: "Something went wrong while deleting user"
        })
    }
}
exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.userData.id;

        const userDetails = await User.findById(id)
            .populate('additionalDetails')
            .exec();
        if (!userDetails)
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: userDetails
        })
    } catch (error) {
        console.log("Error in fetching user details");
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching user details"
        })
    }
}
exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const id = req.userData.id;
        const displayPictureData = await uploadAsset(displayPicture, process.env.FOLDER_NAME, 1000, 1000)
        const updatedDisplayPicture = await User.findByIdAndUpdate(
            id,
            { image: displayPictureData.secure_url },
            { new: true }
        )
        return res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data:updatedDisplayPicture
        })
    } catch (error) {
        console.log("Error in updating display picture",error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while updating display picture",
            
        })
    }
};
exports.getEnrolledCourses = async (req, res) => {
	try {
	  const userId = req.userData.id
	  let userDetails = await User.findOne({
		_id: userId,
	  })
		.populate({
		  path: "courses",
		  populate: {
			path: "courseContent",
			populate: {
			  path: "subSections",
			},
		  },
		})
		.exec()

	  userDetails = userDetails.toObject()
	  var SubsectionLength = 0
	  for (var i = 0; i < userDetails.courses.length; i++) {
		let totalDurationInSeconds = 0
		SubsectionLength = 0
		for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
		  totalDurationInSeconds += userDetails.courses[i].courseContent[
			j
		  ].subSections.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
		  userDetails.courses[i].totalDuration = convertSecondsToDuration(
			totalDurationInSeconds
		  )
		  SubsectionLength +=
			userDetails.courses[i].courseContent[j].subSections.length
		}
		let courseProgressCount = await CourseProgress.findOne({
		  courseID: userDetails.courses[i]._id,
		  userId: userId,
		})
		courseProgressCount = courseProgressCount?.completedVideos.length
		if (SubsectionLength === 0) {
		  userDetails.courses[i].progressPercentage = 100
		} else {
		  // To make it up to 2 decimal point
		  const multiplier = Math.pow(10, 2)
		  userDetails.courses[i].progressPercentage =
			Math.round(
			  (courseProgressCount / SubsectionLength) * 100 * multiplier
			) / multiplier
		}
	  }
  
	  if (!userDetails) {
		return res.status(400).json({
		  success: false,
		  message: `Could not find user with id: ${userDetails}`,
		})
	  }
	  return res.status(200).json({
		success: true,
		data: userDetails.courses,
	  })
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: error.message,
	  })
	}
  }

exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.userData.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }
  
