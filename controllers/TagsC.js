const Tag=require('../models/Tag');

exports.createTag=async (req,res)=>{
    try {
        const {name,description}=req.body;

        //validations
        if(!name||!description ){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        // db call
        const tagData=await Tag.create({name,description});
        console.log(tagData);
        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
            
        });

        
    } catch (error) {
        console.log("Something went wrong while creating Tag",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while creating Tag"
        })
    }
}
exports.showAllTags=async (req,res)=>{
    try {
        const allTags=await Tag.find({},{name:true,description:true});

        return res.status(200).json({
            success:true,
            allTags,
            message:"All tags are returned"
        })
    } catch (error) {
        console.log("Something went wrong while fetching all tags",error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while fetching tags"
        })
    }
}