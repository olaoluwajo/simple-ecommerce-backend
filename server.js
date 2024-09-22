const express = require("express");


const app = express()


require('dotenv').config()

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./utils/db");

dbConnect()
// app.options(
//   "*",
//   cors({
//     origin: "*", 
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dashboard-weld-mu.vercel.app",
      "https://simplemart-mu.vercel.app",
      "http://localhost:3001",
      "http://localhost:5173",
      "*",
    ],
    credentials: true,
  })
);




app.use(bodyParser.json())
app.use(cookieParser());


app.use("/api/home", require("./routes/home/homeRoute"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/dashboard/categoryRoutes"));
app.use("/api", require("./routes/dashboard/productRoutes"));
app.use("/api", require("./routes/dashboard/sellerRoutes"));
app.use("/api", require("./routes/home/customerAuthRoutes"));
app.use("/api", require("./routes/home/cartRoutes"));

app.get("/", (req, res) => res.send("My backend"));


const port = process.env.PORT 


app.listen(port, () => console.log(`Server is running on port ${port}`));