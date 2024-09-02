const formidable = require("formidable");
const { responseReturn } = require("../../utils/response");
const categoryModel = require("../../models/categoryModel");
const cloudinary = require("cloudinary").v2;

class categoryController {
  add_category = async (req, res) => {
    // console.log('this is working')
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      // console.log(fields, files);
      if (err) {
        responseReturn(res, 404, { error: "Something went Wrong" });
      } else {
        let { name } = fields;
        let { image } = files;
        name = name.trim();
        const slug = name.split(" ").join("-");

        cloudinary.config({
          // cloud_name: process.env.CLOUDINARY_NAME,
          // api_key: process.env.CLOUDINARY_API_KEY,
          // api_secret: process.env.CLOUDINARY_API_SECRET,
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        try {
          const result = await cloudinary.uploader.upload(image.filepath, {
            folder: "categories",
          });
          if (result) {
            const category = await categoryModel.create({
              name ,
              slug,
              image: result.url,
            });
            responseReturn(res, 201, {
              category,
              message: "Category created successfully",
            });
          } else {
            responseReturn(res, 404, { error: "Image Upload failed" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: "Internal server error" });
        }
      }
    });
  };

  get_category = async (req, res) => {
    console.log("this is working");
  };
}

module.exports = new categoryController();
