const mongoose = require("mongoose");
const objectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const mongoosePagination = require("mongoose-paginate-v2");

const ProductSchema = new Schema(
  {
    name: {
      required: true,
      type: String,
      minLength: 5,
      maxLength: 255,
      trim: true,
    },
    imageUrl: {
      type: String,
      default:
        "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png",
    },
    count: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    sale: String,
    category: {
      type: String,
      required: true,
    },
    relatedProduct: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
      _id: false,
    },
    comments: {
      type: [
        {
          comment: {
            name: {
              type: String,
              required: true,
            },
            email: {
              type: String,
              required: true,
            },
            comment: {
              type: String,
              required: true,
            },
            createdAt: {
              type: Date,
              default: new Date().toISOString(),
            },
          },
          reply: {
            reply: String,
          },
        },
      ],
      default: [],
    },
    views: {
      type: [Date],
      default: [],
    },
    likes: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: "text", category: "text" });

ProductSchema.plugin(mongoosePagination);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
