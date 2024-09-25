const { responseReturn } = require("../../utils/response");

class orderController {
  place_order = async (req, res) => {
    console.log(req.body);
  };
  // End Method
} 

module.exports = new orderController();
