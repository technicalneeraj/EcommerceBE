const mongoose=require("mongoose");

const orderItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"products",
        required:true
    },
    size:{
        type:String
    },
    quantity:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    discountedPrice:{
        type:Number,
        required:true,
    },
    userId:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"actualuser",
        required:true
    }
});

const OrderItem=mongoose.model("orderItems",orderItemSchema);

module.exports=OrderItem;