const express = require("express");

const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./utils/db");

require("dotenv").config();

dbConnect();

const socket = require("socket.io");
const http = require("http");
const server = http.createServer(app);

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

const io = socket(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://dashboard-weld-mu.vercel.app",
      "https://simplemart-mu.vercel.app",
      "http://localhost:3001",
      "http://localhost:5173",
      "*",
    ],
    credentials: true,
  },
});

var allCustomer = [];
var allSeller = [];
const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomer.some((u) => u.customerId === customerId);
  // console.log(checkUser);
  if (!checkUser) {
    allCustomer.push({
      customerId,
      socketId,
      userInfo,
    });
  }
};

const addSeller = (sellerId, socketId, userInfo) => {
  const checkSeller = allSeller.some((u) => u.sellerId === sellerId);
  if (!checkSeller) {
    allSeller.push({
      sellerId,
      socketId,
      userInfo,
    });
  }
};

const findCustomer = (customerId) => {
  return allCustomer.find((c) => c.customerId === customerId);
};
const findSeller = (sellerId) => {
  return allSeller.find((c) => c.sellerId === sellerId);
};

const remove = (socketId) => {
  allCustomer = allCustomer.filter((c) => c.socketId !== socketId);
  allSeller = allSeller.filter((c) => c.socketId !== socketId);
};

io.on("connection", (soc) => {
  console.log("socket server is running...");

  soc.on("add_user", (customerId, userInfo) => {
    // console.log(userInfo);
    addUser(customerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });
  soc.on("add_seller", (sellerId, userInfo) => {
    // console.log(userInfo);
    addSeller(sellerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });
  soc.on("send_seller_message", (msg) => {
    const customer = findCustomer(msg.receiverId);
    if (customer !== undefined) {
      soc.to(customer.socketId).emit("seller_message", msg);
    }
  });
  soc.on("send_customer_message", (msg) => {
    const seller = findSeller(msg.receverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("customer_message", msg);
    }
  });

  soc.on("disconnect", () => {
    console.log("user disconnected");
    remove(soc.id);
    io.emit("activeSeller", allSeller);
  });
});

// io.on("connection", (socket) => {
//   console.log("Socket server is running...");

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// require("dotenv").config();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// ROUTES
app.use("/api/home", require("./routes/home/homeRoute"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/dashboard/categoryRoutes"));
app.use("/api", require("./routes/dashboard/productRoutes"));
app.use("/api", require("./routes/dashboard/sellerRoutes"));
app.use("/api", require("./routes/home/customerAuthRoutes"));
app.use("/api", require("./routes/home/cartRoutes"));
app.use("/api", require("./routes/order/orderRoutes"));
app.use("/api", require("./routes/chatRoutes"));

// Test route
app.get("/", (req, res) => res.send("Hello Server"));

// Server listening
const port = process.env.PORT;
server.listen(port, () => console.log(`Server is running on port ${port}`));
