const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        maxLength: 50
    },
    parent: [{
        type:String,
       
    }],
    image: { 
        type: String,
        required: true
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
