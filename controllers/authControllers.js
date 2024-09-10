const adminModel = require("../models/adminModel");
const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");
const { responseReturn } = require("../utils/response");
const { createToken } = require("../utils/tokenCreate");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");

const bcrypt = require("bcrypt");

class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel
        .findOne({
          email,
        })
        .select("+password");

      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.password);
        // console.log(isMatch);

        if (isMatch) {
          const token = await createToken({
            id: admin.id,
            // email: admin.email,
            role: admin.role,
          });

          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: "None",
          });
          responseReturn(res, 200, { token, message: "Login Succesfull" });
        } else {
          responseReturn(res, 404, { error: "Password wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  // End Method

  seller_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const seller = await sellerModel
        .findOne({
          email,
        })
        .select("+password");

      if (seller) {
        const isMatch = await bcrypt.compare(password, seller.password);
        // console.log(isMatch);

        if (isMatch) {
          const token = await createToken({
            id: seller.id,
            // email: seller.email,
            role: seller.role,
          });

          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: "None",
          });
          responseReturn(res, 200, { token, message: "Login Succesfull" });
        } else {
          responseReturn(res, 404, { error: "Password wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email not found" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  // End Method

  seller_register = async (req, res) => {
    // console.log(req.body);
    const { name, email, password } = req.body;

    try {
      const getUser = await sellerModel.findOne({ email });
      if (getUser) {
        responseReturn(res, 404, { error: "Email Already Exist" });
      } else {
        const seller = await sellerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: "manually",
          shopInfo: {},
        });
        // console.log(seller);
        await sellerCustomerModel.create({
          myId: seller._id,
        });
        const token = await createToken({
          id: seller.id,
          role: seller.role,
          // email: seller.email,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });
        responseReturn(res, 201, { token, message: "Register Successfull" });
      }
    } catch (error) {
      // console.log(error.message);
      responseReturn(res, 404, { error: "Internal Server Error" });
    }
  };

  // End Method

  getUser = async (req, res) => {
    // console.log("user", req.user);
    const { id, role } = req.user;
    // console.log("id role", id, role);
    try {
      if (role === "admin") {
        const user = await adminModel.findById(id);
        responseReturn(res, 200, { userInfo: user });
      } else {
        // console.log("Seller Info");
        const seller = await sellerModel.findById(id);
        responseReturn(res, 200, { userInfo: seller });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  // End Method

  profile_image_upload = async (req, res) => {
    // console.log("user", req.user);
    // console.log("id", req.id);
    // console.log("body", req.body);
    const { id } = req.user;
    // console.log(id);
    const form = formidable({ multiples: true });
    form.parse(req, async (err, _, files) => {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });
      const { image } = files;

      try {
        const result = await cloudinary.uploader.upload(image.filepath, {
          folder: "profile",
        });
        if (result) {
          await sellerModel.findByIdAndUpdate(id, {
            image: result.url,
          });
          const userInfo = await sellerModel.findById(id);
          responseReturn(res, 201, {
            message: "Profile Image Upload Successfully",
            userInfo,
          });
        } else {
          responseReturn(res, 404, { error: "Image Upload Failed" });
        }
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  // End Method

  profile_info_add = async (req, res) => {
    // console.log(req.body);
    const { division, district, shopName, sub_district } = req.body;

    const { id } = req.user;
    // console.log(id);

    try {
      await sellerModel.findByIdAndUpdate(id, {
        shopInfo: {
          shopName,
          division,
          district,
          sub_district,
        },
      });

      const userInfo = await sellerModel.findById(id);
      responseReturn(res, 201, {
        userInfo,
        message: "Profile info added successfully",
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };

  // END METHOD
}

module.exports = new authControllers();
