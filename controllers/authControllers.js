const adminModel = require("../models/adminModel");
const { responseReturn } = require("../utils/response");
const { createToken } = require("../utils/tokenCreate");

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
            // httpOnly: true,
            // secure: true,
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
    // End Method

    getUser = async (req, res) => {
      const { id, role } = req;

      try {
        if (role === "admin") {
          const user = await adminModel.findById(id);
          responseReturn(res, 200, { userInfo: user });
        } else {
          console.log("Seller Info");
        }
      } catch (error) {
        console.log(error.message);
      }
    };
  };
}

module.exports = new authControllers();
