const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');

exports.createSection = async (req, res) => {
    try {
        const { sectionName, courseId } = req.body;

        if (!sectionName || !courseId)
            return res.status(403).json({
                success: false,
                message: "Missing properties"
            })
        
        const newSectionData=await Section.create({
            sectionName
        });
        //Adding section id in course
        const updatedCourseDetails =await Course.findByIdAndUpdate(courseId,{$push:{courseContent:newSectionData._id}},{new:course}).populate({
            path:'courseContent',
            populate:{
                path:'SubSection'
            }.exec()
        })

        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails
        });
    } catch (error) {
        console.log("Error in creating section",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while creating Section"
        })
    }
};
exports.updateSection=async (req,res)=>{
    try {
    const {sectionName,sectionId}=require.body;

    if(!sectionName || !sectionId){
        return res.status(403).json({
            success: false,
            message: "Missing properties"
        })
    };
    const updatedSection=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
    return res.status(200).json({
        success:true,
        message:"Section updated successfully",
        updatedSection
    })
    } catch (error) {
        console.log("Error in updating section",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while updating Section"
        })
    }
}
exports.deleteSection=async (req,res)=>{
    try {
        const {sectionId}=req.body;
        await Section.findByIdAndDelete(sectionId);
        await Course.updateMany(
            { courseContent: sectionId },
            { $pull: { courseContent: sectionId } }
          );
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            
        })
    } catch (error) {
        console.log("Error in deleting section",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while deleting Section"
        })
    }
}