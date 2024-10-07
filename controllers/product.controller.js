const Product=require("../models/product");
const Category = require("../models/category");
const {HTTP_STATUS}=require("../config/constants");

const addProductHandler = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            price, 
            brand, 
            category, 
            stock, 
            isFeatured, 
            status, 
            tags 
        } = req.body;

        const mainImage = req.files['mainImage'][0].path;
        const otherImages = req.files['otherImages'] ? req.files['otherImages'].map(file => file.path) : [];

        const images = [
            { url: mainImage, alt: 'Main Image' },
            ...otherImages.map(url => ({ url, alt: 'Other Image' }))
        ];

        const newProduct = new Product({
            name,
            description,
            price,
            brand,
            category,
            stock,
            images,  // Updated to match schema
            isFeatured,
            status,
            tags
        });

        await newProduct.save();

        res.status(HTTP_STATUS.CREATED).json({ message: 'Product added successfully' }); //status code and message in cosntant
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error adding product' });
    }

}

const getProductsHandler = async (req, res) => { 
        const data = await Product.find({})
            .sort({ createdAt: -1 }) // front se 
            .limit(4); // front se limit
        res.status(HTTP_STATUS.OK).json({ message: data });
};

const getProductById=async(req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);
    if(product){
        res.status(HTTP_STATUS.OK).json({message:"succesffully founded",product}); // constants
    }else{
        res.status(HTTP_STATUS.NOT_FOUND).json({message:"Product with given id not founded"});
    }
}

const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (category) {
        res.status(HTTP_STATUS.OK).json({ message: "Successfully retrieved category data", category });
    } else {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No category found for the given ID" });
    }
}

module.exports={
    getCategoryById,
    getProductById,
    addProductHandler,
    getProductsHandler
};