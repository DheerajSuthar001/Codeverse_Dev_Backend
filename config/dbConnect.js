const mongoose=require('mongoose');
require('dotenv').config();


exports.dbConnect=()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>{
        console.log("Connected to database successfully");
    })
    .catch((error)=>{
        console.log("Unable to connect database");
        console.log(error);
        process.exit(1);
    });
}