const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      _id: mongoose.Schema.Types.ObjectId,
      email: String,
      name: {
        required: true,
        type: String,
      },
      phoneNumber: {
        required: true,
        type: Number,
      },
      address: {
        province: String,
        city: String,
        address: String,
        postCode: String,
      },
    },
    products: [
      {
        productId: {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
          imageUrl: [String],
          price: Number,
        },
        quantity: Number,
        _id: false,
      },
    ],
    status: {
      type: Number,
      default: 1,
    },
    note: String,
    paymentInfo: {
      date: Date,
      totalPrice: Number,
      shopTrackingCode: Number,
      postTrackingCode: Number,
      referenceId: String,
      bankTrackingCode: String,
    },
  },
  { timestamps: true }
);

orderSchema.index({
  "user.email": "text",
});

module.exports = mongoose.model("Order", orderSchema);
