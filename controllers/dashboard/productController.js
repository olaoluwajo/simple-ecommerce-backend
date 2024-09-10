const formidable = require("formidable");
const { responseReturn } = require("../../utils/response");
const productModel = require("../../models/productModel");
const cloudinary = require("cloudinary").v2;

class productController {
  add_product = async (req, res) => {
    const { id } = req.user;
    // console.log("post", id);
    // console.log("product working");
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      // console.log(files.images[0]);
      // console.log(field);
      let {
        name,
        category,
        description,
        stock,
        price,
        discount,
        shopName,
        brand,
      } = field;
      const { images } = files;
      name = name.trim();
      const slug = name.split(" ").join("-");
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });
      try {
        let allImageUrl = [];
        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i].filepath, {
            folder: "products",
          });

          allImageUrl = [...allImageUrl, result.url];
        }

        await productModel.create({
          sellerId: id,
          name,
          slug,
          shopName,
          category: category.trim(),
          description: description.trim(),
          stock: parseInt(stock),
          price: parseInt(price),
          discount: parseInt(discount),
          images: allImageUrl,
          brand: brand.trim(),
          // images: allImageUrl,
          // sold: 0,
          // views: 0,
          // ratings: 0,
          // reviews: [],
          // createdAt: new Date(),
          // updatedAt: new Date(),
        });
        responseReturn(res, 201, {
          message: "Product added successfully",
        });
      } catch (error) {
        responseReturn(res, 500, {
          error: error.message,
        });
      }
    });
  };

  // End Method

  products_get = async (req, res) => {
    // console.log(req.query)
    const { page, searchValue, perPage } = req.query;
    // console.log('getuserId', id);
    const { id } = req.user;
    const skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      if (searchValue) {
        const products = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId: id,
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalProduct = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId: id,
          })
          .countDocuments();
        responseReturn(res, 200, {
          products,
          totalProduct,
          // message: "Categories fetched successfully",
        });
      } else {
        const products = await productModel
          .find({ sellerId: id })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalProduct = await productModel
          .find({ sellerId: id })
          .countDocuments();
        responseReturn(res, 200, {
          products,
          totalProduct,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // End Method

  product_get = async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 200, {
        product,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // END METHOD

  product_update = async (req, res) => {
    let { name, description, discount, price, brand, stock, productId } =
      req.body;
    name = name.trim();
    const slug = name.split(" ").join("-");
    try {
      await productModel.findByIdAndUpdate(productId, {
        name,
        slug,
        description,
        discount,
        price,
        brand,
        stock,
      });

      const product = await productModel.findById(productId);
      responseReturn(res, 201, {
        message: "Product edited successfully",
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };

  product_img_update = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      // console.log(field)
      // console.log(files);
      const { productId, oldImage } = field;
      const { newImage } = files;

      if (err) {
        responseReturn(res, 500, {
          error: err.message,
        });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });
          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "products",
          });
          if (result) {
            let { images } = await productModel.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await productModel.findByIdAndUpdate(productId, { images });

            const product = await productModel.findById(productId);
            responseReturn(res, 200, {
              product,
              message: "Product Image Updated Successfully",
            });
          } else {
            responseReturn(res, 404, { error: "Image Upload Failed" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: error.message });
        }
      }
    });
  };
  // END METHOD


}
module.exports = new productController();
