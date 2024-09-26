const mongoose=require("mongoose");

const AddressSchema=new mongoose.Schema({
    street: { type: String, trim: true }, 
    city: { type: String, trim: true }, 
    state: { type: String, trim: true }, 
    postalCode: { type: String, trim: true }, 
    country: { type: String, trim: true },
    user:{
        type:mongoose.type.Schema.Types.ObjectId,
        ref:"actualuser"
    },
});

const Address=mongoose.model("addresses",AddressSchema);

module.exports=Address;