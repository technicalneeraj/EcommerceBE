require('dotenv').config();
const express = require("express");
const cors = require('cors');
const connectDB = require('./dbConn');
const Banner = require("./models/banner"); 
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authentication.routes');
const productRoutes =require("./routes/product.routes");
const categoryRoutes=require("./routes/category.routes"); 
const {addingCategories}=require("./utils/addingCategory")

const app = express();
const port = process.env.PORT || 8080; 
app.use(cors({
    origin: 'http://localhost:5173', // url whitelist
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



 // index route 
app.use("/", authRoutes);
app.use("/product",productRoutes);
app.use('/api/categories', categoryRoutes);

// custom error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});



app.get("/Bannerdata", async (req, res) => {
    const data = await Banner.find({});
    res.status(200).json(data);
})

app.listen(port, () => {
    console.log(`Listening on the port ${port}`);
    connectDB();
});
