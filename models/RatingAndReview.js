const mongoose=require('mongoose');

const RatingAndReview=new mongoose.Schema({
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true,
        index:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true 
    },
    rating:{
        type:Number,
        required:true
    },
    review:{
        type:String,
    }

    
})
module.exports=mongoose.model("RatingAndReview",RatingAndReview); 