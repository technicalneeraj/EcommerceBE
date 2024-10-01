const Product=require("../Models/Product");

const addProductHandler=async(req,res)=>{
    try {
        console.log('Request Body:', req?.body);
        console.log('Request Files:', req?.files);
        // const { name, description, price, brand, category, stock, isFeatured, status, tags } = req.body;
        // console.log("hi");
        // const mainImage = req.files['mainImage'][0].path; // URL of the uploaded main image
        // const otherImages = req.files['otherImages'] ? req.files['otherImages'].map(file => file.path) : [];

        // const newProduct = new Product({
        //     name,
        //     description,
        //     price,
        //     brand,
        //     category,
        //     stock,
        //     mainImage,
        //     otherImages,
        //     isFeatured,
        //     status,
        //     tags
        // });
        // console.log(newProduct)

        // await newProduct.save();

        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Error adding product' });
    }
}

module.exports={addProductHandler};