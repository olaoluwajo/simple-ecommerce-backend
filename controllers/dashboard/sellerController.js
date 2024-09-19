const formidable = require("formidable");
const { responseReturn } = require("../../utils/response");
const sellerModel = require("../../models/sellerModel");
const cloudinary = require("cloudinary").v2;

class sellerController {
  request_seller_get = async (req, res) => {
    /**console.log(req.query);**/

    const { page, searchValue, parPage } = req.query;
    const skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
      } else {
        const sellers = await sellerModel
          .find({ status: "pending" })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalSeller = await sellerModel
          .find({ status: "pending" })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSeller });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // end method

  get_sellers = async (req, res) => {
    // console.log(req)

    const { page, searchValue, parPage } = req.query;
    const skipPage = parseInt(parPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
      } else {
        const allSellers = await sellerModel
          .find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });

        responseReturn(res, 200, { allSellers });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // end method

  get_seller = async (req, res) => {
    const { sellerId } = req.params;
    /** console.log("sellerId", sellerId);**/

    try {
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 200, { seller });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // end method

  seller_status_update = async (req, res) => {
    const { sellerId, status } = req.body;
    // console.log("sellerId", sellerId);
    // console.log("status", status);

    try {
      await sellerModel.findByIdAndUpdate(sellerId, { status });
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 200, {
        seller,
        message: "Seller Status Updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // end method
}

module.exports = new sellerController();
