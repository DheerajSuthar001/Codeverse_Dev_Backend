const SubSection=require('../models/SubSection');
const Section=require('../models/Section');
const { uploadAsset,deleteAsset } = require('../utils/AssetUploader');
require('dotenv').config();
exports.createSubSection=async (req,res)=>{
    try {
        const {title,description, sectionId}=req.body;
        const file=req.files.video;
        if(!title||!description||!sectionId ||!file){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        const videoDetails=await uploadAsset(file,process.env.FOLDER_NAME)

        const newSubSection=await SubSection.create({
            title,
            description,
            timeDuration:videoDetails.duration,
            videoUrl:videoDetails.secure_url
        });

        const updatedSection=await Section.findByIdAndUpdate(sectionId,{
            $push:{
                subSections:newSubSection._id
            }
        },{new:true}).populate({path:'subSections'}).exec();
        res.status(200).json({
            success:true,
            message:"SubSection created successfully",
            data:updatedSection
        })
    } catch (error) {
        console.log("Error in creating subSection",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while creating subSection"
        })
    }
};
exports.updateSubSection=async (req,res)=>{
    try {
        const { sectionId,subSectionId, title, description } = req.body
        const subSection = await SubSection.findById(subSectionId)
    
        if (!subSection) {
          return res.status(404).json({
            success: false,
            message: "SubSection not found",
          })
        }
    
        if (title !== undefined) {
          subSection.title = title
        }
    
        if (description !== undefined) {
          subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
          const video = req.files.video
          const uploadDetails = await uploadAsset(
            video,
            process.env.FOLDER_NAME
          )
          subSection.videoUrl = uploadDetails.secure_url
          subSection.timeDuration = `${uploadDetails.duration}`
        }
    
        await subSection.save()
        const updatedSection = await Section.findById(sectionId).populate("subSections")
        return res.json({
          success: true,
          data:updatedSection,
          message: "Section updated successfully",
        })
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the section",
        })
      }
}
exports.deleteSubSection=async (req,res)=>{
    try {
        const { subSectionId, sectionId } = req.body
        
        await Section.findByIdAndUpdate(
          { _id: sectionId },
          {
            $pull: {
              subSections: subSectionId,
            },
          }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
    
        if (!subSection) {
          return res
            .status(404)
            .json({ success: false, message: "SubSection not found" })
        }
        const updatedSection = await Section.findById(sectionId).populate("subSections").exec();

        return res.json({
          success: true,
          data:updatedSection,
          message: "SubSection deleted successfully",
        })
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the SubSection",
        })
      }
}