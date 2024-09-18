const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utils/response");

class homeControllers {
  // This makes it easier to display products in rows, for example, in a grid with three products in each row on a webpage!
  // formatedProduct = (products) => {
  //   const productArray = [];
  //   let i = 0;
  //   while (i < products.length) {
  //     let temp = [];
  //     let j = i;
  //     while (j < i + 3) {
  //       if (products[j]) {
  //         temp.push(products[j]);
  //       }
  //       j++;
  //     }
  //     productArray.push([...temp]);
  //     i = j;
  //   }

  //   return productArray;
  // };

  // This function here is to display the products in THREEs
  formatedProduct = (products) => {
    const productArray = [];
    // Start a counter 'i' at 0, which will help us keep track of our position in the products array
    let i = 0;
    // Looping through the products list until we've processed all of them
    while (i < products.length) {
      let temp = [];
      let j = i;
      while (j < i + 3) {
        if (products[j]) {
          temp.push(products[j]);
        }
        j++;
      }
      productArray.push([...temp]);
      i = j;
    }
    return productArray;
  };

  get_categories = async (req, res) => {
    try {
      const categories = await categoryModel.find({});
      responseReturn(res, 200, { categories });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_products = async (req, res) => {
    try {
      const products = await productModel
        .find({})
        .limit(12)
        .sort({ createdAt: -1 });

      const allProduct1 = await productModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });

      const latest_product = this.formatedProduct(allProduct1);

      const allProduct2 = await productModel.find({}).limit(9).sort({
        rating: -1,
      });
      const topRated_product = this.formatedProduct(allProduct2);

      const allProduct3 = await productModel
        .find({})
        .limit(9)
        .sort({ discount: -1 });

      const discount_product = this.formatedProduct(allProduct3);

      responseReturn(res, 200, {
        products,
        latest_product,
        topRated_product,
        discount_product,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  price_range_product = async (req, res) => {
     try {
       const priceRange = {
         low: 0,
         high: 0,
       };
       const products = await productModel.find({}).limit(9).sort({
         createdAt: -1, // 1 for asc -1 is for Desc
       });
       const latest_product = this.formateProduct(products);
       const getForPrice = await productModel.find({}).sort({
         price: 1,
       });
       if (getForPrice.length > 0) {
         priceRange.high = getForPrice[getForPrice.length - 1].price;
         priceRange.low = getForPrice[0].price;
       }
       responseReturn(res, 200, {
         latest_product,
         priceRange,
       });
     } catch (error) {
       console.log(error.message);
     }
  };
}

module.exports = new homeControllers();
