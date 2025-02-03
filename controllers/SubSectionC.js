const SubSection=require('../models/SubSection');
const Section=require('../models/Section');
const { uploadAsset,deleteAsset } = require('../utils/AssetUploader');
require('dotenv').config();
exports.createSubSection=async (req,res)=>{
    try {
        const {title,description, sectionId}=req.body;
        const file=req.files.videoFile;
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
            updatedSection
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
        const {title,description,timeDuration, subSectionId,oldVideoPublicId}=req.body;
        const file=req.files.videoFile;

        if(!title||!description||!timeDuration||!subSectionId ||!file ||!oldVideoPublicId){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        const AssetDeleted=await deleteAsset(oldVideoPublicId);
        const videoDetails=await uploadAsset(file,process.env.FOLDER_NAME);
        const updatedSubSection=await SubSection.findByIdAndUpdate(subSectionId,{
            title,
            description,
            timeDuration,
            videoUrl:videoDetails.secure_url
        });
        return res.status(200).json({
            success:true,
            message:"SubSection updated successfully"
        })

    } catch (error) {
        console.log("Error in updating subSection",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while updating subSection"
        })
    }
}
exports.deleteSubSection=async (req,res)=>{
    try {
        const {subSectionId,oldVideoPublicId,sectionId}=req.body;
        if(!subSectionId ||!sectionId ||!oldVideoPublicId){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        await deleteAsset(oldVideoPublicId);
        await SubSection.findByIdAndDelete(subSectionId);
        await Section.findByIdAndUpdate(sectionId,{$pull:{subSections:subSectionId}})
        return res.status(200).json({
            success:true,
            message:"SubSection deleted successfully"
        })
    } catch (error) {
        console.log("Error in deleting subSection",error);
        res.status(500).json({
            success:false,
            message:"Something went wrong while deleting subSection"
        })
    }
}