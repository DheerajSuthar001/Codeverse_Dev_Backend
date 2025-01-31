const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');
const { uploadAsset } = require('../utils/AssetUploader');
exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const userId = req.userData.id;
        if (!contactNumber || !gender || !userId) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }
        const Userdetail = await User.findById(userId);
        const profileId = Userdetail.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();
        return res.status(200).json({
            success: true,
            message: "Profile details updated successfully"
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

        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);
        await Course.updateMany({ studentEnrolled: id }, {
            $pull: {
                studentEnrolled: id
            }
        })
        await User.findByIdAndDelete(id);
        res.status(200).json({
            sucess: true,
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
        res.status(200).json({
            success: true,
            message: "Image updated successfully"
        })
    } catch (error) {
        console.log("Error in updating display picture");
        res.status(500).json({
            success: false,
            message: "Something went wrong while updating display picture"
        })
    }
};
exports.getEnrolledCourses = async (req, res) => {
    try {

        const id = req.userData.id;
        const enrolledCourses = await User.findById(id, { courses }).populate('courses').exec();
        if (!enrolledCourses)
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        res.status(200).json({
            success:true,
            message:"All enrolled courses fetched successfully",
            data:enrolledCourses
        })
    } catch (error) {
        console.log("Error in fetching enrolled courses");
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching enrolled courses"
        })
    }
}
