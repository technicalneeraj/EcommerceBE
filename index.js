require('dotenv').config();
const express = require("express");
const cors = require('cors');
const connectDB = require('./dbconn');
const Banner = require("./Models/Banner");
const cookieParser = require('cookie-parser');
const otpRoutes = require('./Routes/Authentication');



const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true
}));

app.use(cookieParser());


app.use("/", otpRoutes);

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
