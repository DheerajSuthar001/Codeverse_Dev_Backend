const cloudinary=require('cloudinary').v2;

exports.uploadImageToCloudinary=async (file,folder,quality,height)=>{
    try {
        const option={folder};
        if(height)
            option.height=height;
        if(quality)
            option.quality=quality;

        option.resource_type="auto";
        return await cloudinary.uploader.upload(file.tempFilePath,option)
    } catch (error) {
        console.log("something went wronf while uploading image")
    }
}