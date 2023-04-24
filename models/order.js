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
      cellPhone: {
        required: true,
        type: Number,
      },
      address: {
        province: String,
        city: String,
        address: String,
        postCode: String,
      },
      // userId: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   required: true,
      //   ref: "User",
      // },
    },
    products: [{}],
    status: {
      type: Number,
      default: 1,
    },
    paymentInfo: {
      date: Date,
      shopTrackingCode: Number,
      postTrackingCode: Number,
    },
  },
  { timestamps: true }
);

orderSchema.index({
  "user.email": "text",
});

module.exports = mongoose.model("Order", orderSchema);
