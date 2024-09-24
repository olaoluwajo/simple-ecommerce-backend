const cartModel = require("../../models/cartModel");
const categoryModel = require("../../models/categoryModel");
const { responseReturn } = require("../../utils/response");
const {
  mongo: { ObjectId },
} = require("mongoose");

class cartController {
  add_to_cart = async (req, res) => {
    // console.log(req.body);
    const { userId, productId, quantity } = req.body;
    try {
      const product = await cartModel.findOne({
        $and: [
          {
            productId: {
              $eq: productId,
            },
          },
          {
            userId: {
              $eq: userId,
            },
          },
        ],
      });
      if (product) {
        responseReturn(res, 404, { error: "Product Already Added To Cart" });
      } else {
        const product = await cartModel.create({
          userId,
          productId,
          quantity,
        });
        responseReturn(res, 201, {
          message: "Added To Cart Successfully",
          product,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method----------------------------------

  get_cart_products = async (req, res) => {
    // console.log(req);
    const co = 5;
    const { userId } = req.params;
    // console.log("USERID", userId);

    try {
      const cart_products = await cartModel.aggregate([
        {
          $match: {
            userId: {
              $eq: new ObjectId(userId),
            },
          },
        },

        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "products",
          },
        },
      ]);
      // console.log("CART PRODUCTS", cart_products);

      let buy_product_item = 0;
      let calculatePrice = 0;
      let cart_product_count = 0;
      const outOfStockProduct = cart_products.filter(
        (p) => p.products[0].stock < p.quantity
      );
      for (let i = 0; i < outOfStockProduct.length; i++) {
        cart_product_count = cart_product_count + outOfStockProduct[i].quantity;
      }
      // console.log("outOfStockProduct", outOfStockProduct);

      const stockProduct = cart_products.filter(
        (p) => p.products[0].stock >= p.quantity
      );
      // console.log("stockProduct", stockProduct.length);

      for (let i = 0; i < stockProduct.length; i++) {
        const { quantity } = stockProduct[i];
        cart_product_count = buy_product_item + quantity;

        buy_product_item = buy_product_item + quantity;
        const { price, discount } = stockProduct[i].products[0];

        if (discount !== 0) {
          calculatePrice =
            calculatePrice +
            quantity * (price - Math.floor((price * discount) / 100));
        } else {
          calculatePrice = calculatePrice + quantity * price;
        }
      }
      let p = [];
      let unique = [
        ...new Set(stockProduct.map((p) => p.products[0].sellerId.toString())),
      ];
      for (let i = 0; i < unique.length; i++) {
        let price = 0;
        for (let j = 0; j < stockProduct.length; j++) {
          const tempProduct = stockProduct[j].products[0];
          if (unique[i] === tempProduct.sellerId.toString()) {
            let pri = 0;
            if (tempProduct.discount !== 0) {
              pri =
                tempProduct.price -
                Math.floor((tempProduct.price * tempProduct.discount) / 100);
            } else {
              pri = tempProduct.price;
            }
            pri = pri - Math.floor((pri * co) / 100);
            price = price + pri * stockProduct[j].quantity;
            p[i] = {
              sellerId: unique[i],
              shopName: tempProduct.shopName,
              price,
              products: p[i]
                ? [
                    ...p[i].products,
                    {
                      _id: stockProduct[j]._id,
                      quantity: stockProduct[j].quantity,
                      productInfo: tempProduct,
                    },
                  ]
                : [
                    {
                      _id: stockProduct[j]._id,
                      quantity: stockProduct[j].quantity,
                      productInfo: tempProduct,
                    },
                  ],
            };
          }
        }
      }
      // console.log("calculatePrice", p);
        responseReturn(res, 200, {
          cart_products: p,
          price: calculatePrice,
          cart_product_count,
          shipping_fee: 200 * p.length,
          outOfStockProduct,
          buy_product_item,
        });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method----------------------------------
}
module.exports = new cartController();
