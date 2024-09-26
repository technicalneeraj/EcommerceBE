const mongoose=require("mongoose");

const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:true,
    },
    user:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"actualuser",
        required:true,
    },
    product:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"products",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

const Review=mongoose.model("reviews",reviewSchema);

module.exports=Review;