const cartController = require("../../controllers/home/cartController");



const router = require("express").Router();

router.post("/home/product/add-to-cart", cartController.add_to_cart); 

module.exports = router;
