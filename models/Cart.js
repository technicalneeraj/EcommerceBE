const mongoose=require("mongoose");

const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    cartItems:[
        {
            type:mongoose.type.Schema.Types.ObjectId,
            ref:"cartitems",
            required:true
        }
    ],
    totalPrice:{
        type:Number,
        required:true,
        default:0
    },
    totalItem:{
        type:Number,
        required:true,
        default:0
    },
    totalDiscountedPrice:{
        type:Number,
        required:true,
        default:0
    },
    discount:{
        type:Number,
        required:true,
        default:0
    }
});

const Cart=mongoose.model("cart",cartSchema);

module.exports=Cart;