const moment = require("moment");
const { responseReturn } = require("../../utils/response");
const customerOrder = require("../../models/customerOrder");
const cartModel = require("../../models/cartModel");
const authOrderModel = require("../../models/authOrder");
const {
  mongo: { ObjectId },
} = require("mongoose");

class orderController {
  paymentCheck = async (id) => {
    try {
      const order = await customerOrder.findById(id);
      if (order.payment_status === "unpaid") {
        await customerOrder.findByIdAndUpdate(id, {
          delivery_status: "cancelled",
        });
        await authOrderModel.updateMany(
          {
            orderId: id,
          },
          {
            delivery_status: "cancelled",
          }
        );
      }
      return true;
    } catch (error) {
      console.log(error);
    }
  };
  // end method

  place_order = async (req, res) => {
    // console.log(req.body);
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;
    let authorOrderData = [];
    let cartId = [];
    const tempDate = moment(Date.now()).format("LLL");
    // console.log("TEMPDATE", tempDate);

    let customerOrderProduct = [];

    for (let i = 0; i < products.length; i++) {
      const pro = products[i].products;
      // console.log("proLENGTH", pro.length);
      for (let j = 0; j < pro.length; j++) {
        const tempCusPro = pro[j].productInfo;

        tempCusPro.quantity = pro[j].quantity;
        // console.log("tempCusPro", tempCusPro.quantity);
        customerOrderProduct.push(tempCusPro);
        if (pro[j]._id) {
          cartId.push(pro[j]._id);
        }
      }
    }
    // console.log("customerOrderProduct", customerOrderProduct);

    try {
      const order = await customerOrder.create({
        customerId: userId,
        shippingInfo,
        products: customerOrderProduct,
        price: price + shipping_fee,
        payment_status: "unpaid",
        delivery_status: "pending",
        date: tempDate,
      });

      for (let i = 0; i < products.length; i++) {
        const pro = products[i].products;
        const pri = products[i].price;
        const sellerId = products[i].sellerId;
        let storePro = [];
        for (let j = 0; j < pro.length; j++) {
          const tempPro = pro[j].productInfo;
          tempPro.quantity = pro[j].quantity;
          storePro.push(tempPro);
        }
        authorOrderData.push({
          orderId: order.id,
          sellerId,
          products: storePro,
          price: pri,
          payment_status: "unpaid",
          shippingInfo: "Easy Main Warehouse",
          delivery_status: "pending",
          date: tempDate,
        });
      }
      await authOrderModel.insertMany(authorOrderData);
      for (let k = 0; k < cartId.length; k++) {
        await cartModel.findByIdAndDelete(cartId[k]);
      }
      setTimeout(() => {
        this.paymentCheck(order.id);
      }, 15000);
      responseReturn(res, 200, {
        message: "Order Placed Success",
        orderId: order.id,
      });
    } catch (error) {
      console.log("ERROR", error.message);
      // responseReturn(res, 500, { error: error.message });
    }
  };
  // End Method

  get_customer_dashboard_data = async (req, res) => {
    const { userId } = req.params;
    // console.log(userId);
    try {
      const recentOrders = await customerOrder
        .find({
          customerId: new ObjectId(userId),
        })
        .limit(5);
      const pendingOrder = await customerOrder
        .find({
          customerId: new ObjectId(userId),
          delivery_status: "pending",
        })
        .countDocuments();
      const totalOrder = await customerOrder
        .find({
          customerId: new ObjectId(userId),
        })
        .countDocuments();
      const cancelledOrder = await customerOrder
        .find({
          customerId: new ObjectId(userId),
          delivery_status: "cancelled",
        })
        .countDocuments();
      responseReturn(res, 200, {
        recentOrders,
        pendingOrder,
        totalOrder,
        cancelledOrder,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // End Method

  get_orders = async (req, res) => {
    // console.log(req.params);
    const { customerId, status } = req.params;
    try {
      let orders = [];
      if (status !== "all") {
        orders = await customerOrder.find({
          customerId: new ObjectId(customerId),
          delivery_status: status,
        });
      } else {
        orders = await customerOrder.find({
          customerId: new ObjectId(customerId),
        });
      }
      responseReturn(res, 200, {
        orders,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  get_order_details = async (req, res) => {
    // console.log(req.params);
    const { orderId } = req.params;
    try {
      const order = await customerOrder.findById(orderId);
      responseReturn(res, 200, {
        order,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method
}

module.exports = new orderController();
