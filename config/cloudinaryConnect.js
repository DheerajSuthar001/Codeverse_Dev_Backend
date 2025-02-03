const cloudinary=require('cloudinary');
require('dotenv').config();
exports.cloudinaryConnect=()=>{
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.CLOUD_KEY,
            api_secret:process.env.CLOUD_SECRET
        });
        console.log('Connected to cloud successfully');

    } catch (error) {
        console.log("Unable to connect to Cloudinary",error);
        process.exit(1);
    }
}
