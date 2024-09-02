const express = require("express");


const app = express()


require('dotenv').config()

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./utils/db");

dbConnect()
app.options(
  "*",
  cors({
    origin: "*", 
    credentials: true,
  })
);


app.use(bodyParser.json())
app.use(cookieParser());


app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/dashboard/categoryRoutes"));

app.get("/", (req, res) => res.send("My backend"));


const port = process.env.PORT 


app.listen(port, () => console.log(`Server is running on port ${port}`));