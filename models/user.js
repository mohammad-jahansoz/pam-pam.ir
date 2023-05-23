const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: String,
    token: String,
    expireToken: Number,
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: Number,
        _id: false,
      },
    ],
    order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.methods.addToCart = async function (productId, quantity) {
  let cartItem = [...this.cart];
  const productIndex = cartItem.findIndex((i) => {
    return i.productId.toString() === productId.toString();
  });
  let tekrari;
  if (productIndex < 0) {
    cartItem.push({ productId, quantity });
    tekrari = false;
  } else {
    cartItem[productIndex].quantity += quantity;
    tekrari = true;
  }

  this.cart = cartItem;
  await this.save();
  return tekrari;
};

const User = new mongoose.model("user", UserSchema);
module.exports = User;
