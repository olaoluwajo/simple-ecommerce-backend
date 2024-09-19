const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utils/response");
const queryProducts = require("../../utils/queryProducts");

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
        // 1 for asc -1 is for Desc
        createdAt: -1,
      });
      const latest_product = this.formatedProduct(products);
      const getForPrice = await productModel.find({}).sort({
        price: 1,
      });
      if (getForPrice.length > 0) {
        priceRange.high = getForPrice[getForPrice.length - 1].price;
        priceRange.low = getForPrice[0].price;
      }

      //   console.log(priceRange);
      responseReturn(res, 200, {
        latest_product,
        priceRange,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  query_products = async (req, res) => {
    const perPage = 12;

    // Create a new query object that includes parPage
    const modifiedQuery = { ...req.query, perPage };

    console.log("Modified Query Parameters: ", modifiedQuery);

    try {
      // Fetch products and sort them by createdAt
      const products = await productModel.find({}).sort({
        createdAt: -1,
      });

      console.log("Total Products Found: ", products.length);

      // Create an instance of queryProducts with the modified query
      const queryInstance = new queryProducts(products, modifiedQuery);

      // Get the total number of products after applying filters
      const totalProduct = queryInstance
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .sortByPrice()
        .countProducts();

      // Apply filters, sorting, and pagination (limit and skip)
      const result = queryInstance
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .sortByPrice()
        .skip()
        .limit()
        .getProducts();

      // Return the response
      responseReturn(res, 200, {
        products: result,
        totalProduct,
        perPage, // Return parPage in the response
      });
    } catch (error) {
      console.log("Error: ", error.message);
      responseReturn(res, 500, { error: "Server error" });
    }
  };

  // end method
}

module.exports = new homeControllers();
