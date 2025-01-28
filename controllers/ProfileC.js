const Profile=require('../models/Profile');
const User=require('../models/User');
const Course=require('../models/Course')
exports.updateProfile=async (req,res)=>{
    try {
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;
        const userId=req.userData.id;
        if(!contactNumber || !gender ||!userId){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        const Userdetail=await User.findById(userId);
        const profileId=Userdetail.additionalDetails;
        const profileDetails=await Profile.findById(profileId);

        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;

        await profileDetails.save();
        return res.status(200).json({
            success:true,
            message:"Profile details updated successfully"
        })
    } catch (error) {
        console.log("Error in updating profile");
        res.status(500).json({
            success:false,
            message:"Something went wrong while updating profile"
        })
    }
}

exports.deleteAccount=async (req,res)=>{
    try {
        const id= req.userData.id;

        const userDetails=await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const profileId=userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);
        await Course.updateMany({studentEnrolled:id},{
            $pull:{
                studentEnrolled:id
            }
        })
        await User.findByIdAndDelete(id);
        res.status(200).json({
            sucess:true,
            message:"User deleted successfully"
        })
    } catch (error) {
        console.log("Error in deleting user");
        res.status(500).json({
            success:false,
            message:"Something went wrong while deleting user"
        })
    }
}