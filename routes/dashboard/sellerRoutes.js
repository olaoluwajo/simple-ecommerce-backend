const sellerController = require("../../controllers/dashboard/sellerController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = require("express").Router();

router.get(
  "/request-seller-get",
  authMiddleware,
  sellerController.request_seller_get,
);
router.get("/get-seller/:sellerId", authMiddleware, sellerController.get_seller);
router.get(
  "/get-sellers",
  authMiddleware,
  sellerController.get_sellers
);
router.post(
  "/seller-status-update",
  authMiddleware,
  sellerController.seller_status_update
);


module.exports = router;
