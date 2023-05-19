const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const nodemailer = require("nodemailer");

const zarinpal_checkout = require("zarinpal-checkout");

const zarinpal = zarinpal_checkout.create(
  "d9d88b03-3514-490a-b6f4-a864a44e0d39",
  true
);

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

exports.deleteCartItem = async (req, res, next) => {
  const productId = req.params.productId;
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { cart: { productId: productId } },
    },
    { new: true }
  );
  res.redirect("/api/product/getcart");
};

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const result = await req.user.addToCart(productId, +quantity);
};

exports.getCart = async (req, res, next) => {
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -views -likes -comments -createdAt -updatedAt -__v"
  );
  res.render("client/cart", { cart: userWithProductsInCart.cart });
};

exports.setOrder = async (req, res, next) => {
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -views -likes -comments -createdAt -updatedAt -__v "
  );

  let totalPrice = 35000;
  for (const product of userWithProductsInCart.cart) {
    totalPrice += product.quantity * product.productId.price;
  }
  const shopTrackingCode = Math.floor(100000 + Math.random() * 900000);

  const payment = await zarinpal.PaymentRequest({
    Amount: totalPrice,
    CallbackURL: "http://127.0.0.1:3000/api/product/verifyOrder",
    Description: "خرید از فروشگاه اینترنتی پم پم - PAM-PAM.IR",
    Email: req.user.email,
    Mobile: req.body.phoneNumber,
  });

  if (payment.status === 100) {
    res.redirect(payment.url);
    const order = new Order({
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: {
          province: req.body.province,
          city: req.body.city,
          address: req.body.address,
          postCode: req.body.postCode,
        },
      },
      note: req.body.note,
      products: userWithProductsInCart.cart,
      paymentInfo: {
        totalPrice: totalPrice,
        shopTrackingCode: shopTrackingCode,
        referenceId: payment.authority,
      },
    });

    await order.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        order: order._id,
      },
    });
  } else {
    res.send("لطفا بعدا دوباره امتحان کنید!");
  }
};

exports.verifyOrder = async (req, res, next) => {
  const Authority = req.query.Authority;
  const order = await Order.findOne({
    "paymentInfo.referenceId": Authority,
  });

  try {
    const receipt = await zarinpal.PaymentVerification({
      Amount: order.paymentInfo.totalPrice,
      Authority: order.paymentInfo.referenceId,
    });
    if (receipt.status === 100 || receipt.status === 101) {
      order.status = 2;
      order.paymentInfo.bankTrackingCode = receipt.RefID;
      order.save();
      res.render("client/receipt", { order, receipt });
    } else {
      return res.render("client/receipt", { order, receipt });
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }

  await User.findByIdAndUpdate(req.user._id, {
    cart: [],
  });
  const products = order.products;
  for (const product of products) {
    await Product.findByIdAndUpdate(product.productId._id, {
      $inc: { count: -product.quantity },
    });
  }
};

exports.getOrderForm = (req, res, next) => {
  res.render("client/orderForm");
};

exports.designOrder = (req, res, next) => {
  res.render("client/receipt");
};
