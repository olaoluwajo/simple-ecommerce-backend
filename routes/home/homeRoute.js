
const homeControllers = require("../../controllers/home/homeContollers");

const router = require("express").Router();

router.get("/get-categories", homeControllers.get_categories);
router.get("/get-products", homeControllers.get_products);

module.exports = router;
