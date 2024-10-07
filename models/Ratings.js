const mongoose=require("mongoose");

const ratingSchema=new mongoose.Schema({
    user:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    product:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"products",
        required:true,
    },
    rating:{
        type:Number,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

const Rating=mongoose.model("ratings",ratingSchema);

module.exports=Rating;

