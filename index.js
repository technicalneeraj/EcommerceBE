require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./dbConn");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authentication.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const userRoutes = require("./routes/user.routes");

const {
  handleCheckoutSessionCompleted,
} = require("./controllers/user.controller");

const addressRoutes = require("./routes/address.routes");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:5173", // url whitelist
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/json" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.post("/api/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const rawBody = req.body;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutSessionCompleted(event);
  }

  res.json({ received: true });
});

app.use("/", authRoutes);
app.use("/product", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/user", userRoutes);
app.use("/address", addressRoutes);


app.use((err, res) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Listening on the port ${port}`);
  connectDB();
});
