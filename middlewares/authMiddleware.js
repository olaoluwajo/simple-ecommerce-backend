const jwt = require("jsonwebtoken");
const sellerModel = require("../models/sellerModel");
const adminModel = require("../models/adminModel");

module.exports.authMiddleware = async (req, res, next) => {
  let accessToken;
  //const { accessToken } = req.cookies;
  if(req.cookies.accessToken){
    accessToken = req.cookies.accessToken
  }else{
    const token = req.headers.authorization;
     accessToken =
      token && token.startsWith("Bearer ") ? token.slice(7).trim() : null;
  }

  console.log("accesstoken", accessToken);
  // Check if the access token is present
  if (!accessToken) {
    return res.status(409).json({ error: "Please Login First" });
  } else {
    try {
      
      const deCodeToken = await jwt.verify(accessToken, process.env.SECRET);
      console.log("role from jwt", deCodeToken);
      let user;
      if (deCodeToken.role === "seller") {
        user = await sellerModel.findById(deCodeToken.id);
      } else {
        
        user = await adminModel.findById(deCodeToken.id);
      }

      user.role = deCodeToken.role;
      user.id = deCodeToken.id;
      req.user = user;
      console.log("user", req.user);
      next();
    } catch (error) {
      return res.status(409).json({ error: "Please Login" });
    }
  }
};
