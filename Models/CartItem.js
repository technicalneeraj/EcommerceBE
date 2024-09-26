const mongoose=require("mongoose");

const cartItemSchema=new mongoose.Schema({
    cart:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"cart",
        required:true
    },
    product:
        {
            type:mongoose.type.Schema.Types.ObjectId,
            ref:"products",
            required:true
        }
    ,
    size:{
        type:String,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
        default:1,
    },
    price:{
        type:Number,
        required:true,
    },
    discountedprice:{
        type:Number,
        required:true,
    },
    userId:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"actualuser",
        required:true
    }

});

const CartItem=mongoose.model("cartitems",cartItemSchema);

module.exports=CartItem;