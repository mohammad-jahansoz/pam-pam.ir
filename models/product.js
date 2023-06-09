const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
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
    details: String,
    imageUrl: [
      {
        type: String,
        default:
          "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png",
      },
    ],
    off: {
      type: Number,
      default: 0,
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
    relatedProduct: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
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
          reply: String,
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
ProductSchema.plugin(aggregatePaginate);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
