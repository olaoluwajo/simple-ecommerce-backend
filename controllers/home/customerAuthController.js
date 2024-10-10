const customerModel = require("../../models/customerModel");
const { responseReturn } = require("../../utils/response");
const bcrypt = require("bcrypt");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const { createToken } = require("../../utils/tokenCreate");
const { compare } = require("bcrypt");

class customerAuthController {
  customer_register = async (req, res) => {
    // console.log(req.body);
    const { name, email, password } = req.body;
    try {
      const customer = await customerModel.findOne({ email });
      if (customer) {
        responseReturn(res, 404, { error: "Email Already Exits" });
      } else {
        const createCustomer = await customerModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password, 10),
          // password: password.trim(),
          method: "manualy",
        });
        await sellerCustomerModel.create({
          myId: createCustomer.id,
        });

        const token = await createToken({
          id: createCustomer.id,
          name: createCustomer.name,
          email: createCustomer.email,
          method: createCustomer.method,
        });
        res.cookie("customerToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, {
          message: "User Register Successfull",
          token,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  customer_login = async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    try {
      const customer = await customerModel
        .findOne({ email })
        .select("+password");
      if (customer) {
        // console.log("Stored hash in DB:", customer.password);
        // console.log("Password from user:", password);
        const match = await bcrypt.compare(password, customer.password);
        // Compare the password
        // const match = await compare(password, customer.password);
        // console.log("Password match:", match);

        if (match) {
          const token = await createToken({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            method: customer.method,
          });
          res.cookie("customerToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 201, {
            message: "Customer Login Successfull",
            token,
          });
        } else {
          responseReturn(res, 404, { error: "Password Wrong" });
        }
      } else {
        responseReturn(res, 404, { error: "Email Not Found" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method
}

module.exports = new customerAuthController();
