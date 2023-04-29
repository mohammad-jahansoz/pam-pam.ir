const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const result = await req.user.addToCart(productId, +quantity);
};

exports.getCart = async (req, res, next) => {
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -likes -comments -createdAt -updatedAt -__v"
  );
  console.log(userWithProductsInCart);
  res.send(userWithProductsInCart);
};

exports.setOrder = async (req, res, next) => {
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -likes -comments -createdAt -updatedAt -__v -imageUrl"
  );

  const products = userWithProductsInCart.cart.map((i) => {
    const productData = { ...i.productId._doc };
    if (productData.count >= i.quantity) {
      return { ...productData, quantity: i.quantity };
    } else {
      return { ...productData, quantity: productData.count };
    }
  });

  const order = new Order({
    user: {
      _id: req.user._id,
      email: req.user.email,
      name: req.body.name,
      cellPhone: req.body.cellPhone,
      address: {
        province: req.body.address.province,
        city: req.body.address.city,
        address: req.body.address.address,
        postCode: req.body.address.postCode,
      },
    },
    products: products,
  });

  await order.save();
  res.send(order);
};

exports.verifyOrder = async (req, res, next) => {
  const orderId = req.body.orderId;

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      $inc: { status: 1 },
      paymentInfo: {
        date: new Date(),
        shopTrackingCode: Math.floor(100000 + Math.random() * 900000),
      },
    },
    { new: true }
  );

  transporter.sendMail({
    from: '"👻فروشگاه اینترنتی میوه خشک پَم پَم👻" <support@pam-pam.ir>',
    to: req.user.email,
    subject: "فاکتور خرید",
    html: `<div>
      <h1>فروشگاه اینترنتی میوه خشک پَم پَم pam-pam.ir</h1>
      <h2>فاکتور خرید</h2>
      <h4>کد پیگیری : ${order.paymentInfo.shopTrackingCode}</h4>
      <h6>${order.products}</h6>
      <p>ازینکه فروشگاه مارو انتخاب کردید از شما سپاسگذاریم!</p>
      </div>`,
  });

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        order: orderId,
      },
      cart: [],
    },
    { new: true }
  );

  const products = order.products;
  for (const product of products) {
    await Product.findByIdAndUpdate(product._id, {
      $inc: { count: -product.quantity },
    });
  }

  res.send(order);
};

exports.deleteCartItem = async (req, res, next) => {
  const productId = req.body.productId;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { cart: { productId: productId } },
    },
    { new: true }
  );
  console.log(user);
  res.send(user);
};
