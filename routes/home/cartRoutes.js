const cartController = require("../../controllers/home/cartController");

const router = require("express").Router();

router.post("/home/product/add-to-cart", cartController.add_to_cart);
router.get(
  "/home/product/get-cart-product/:userId",
  cartController.get_cart_products
);

module.exports = router;
