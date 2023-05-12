const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const { getPaymentDriver } = require("monopay");
const nodemailer = require("nodemailer");
const monopay = require("monopay");

const zarinpal = new monopay.Zarinpal({
  merchantId: "d9d88b03-3514-490a-b6f4-a864a44e0d39",
});

// const driver = getPaymentDriver("zarinpal", {
//   merchantId: "d9d88b03-3514-490a-b6f4-a864a44e0d39",
// });

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
    "-relatedProduct -category -views -likes -comments -createdAt -updatedAt -__v"
  );
  // console.log(userWithProductsInCart);
  // res.send(userWithProductsInCart);
  res.render("client/cart", { cart: userWithProductsInCart.cart });
};

exports.setOrder = async (req, res, next) => {
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -views -likes -comments -createdAt -updatedAt -__v  -count"
  );

  let totalPrice = 35000;
  for (const product of userWithProductsInCart.cart) {
    totalPrice += product.quantity * product.productId.price;
  }

  const shopTrackingCode = Math.floor(100000 + Math.random() * 900000);

  const testPayment = await zarinpal.requestPayment({
    amount: totalPrice,
    callbackUrl: "http://127.0.0.1:3000/api/product/verifyOrder/",
    description: "خرید از فروشگاه اینترنتی پَم پَم _ pam-pam.ir",
  });

  // const paymentInfo = await driver.requestPayment({
  //   amount: totalPrice,
  //   callbackUrl: "http://127.0.0.1:3000/api/product/verifyOrder",
  //   description: "خرید از فروشگاه اینترنتی پَم پَم _ pam-pam.ir",
  // });

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
      referenceId: testPayment.referenceId,
    },
  });

  await order.save();
  console.log(order.products);
  res.send(
    `<html>
      <body>
          <h1> در حال انتقال شما به صفحه پرداخت هستیم </h1>
          <script>${testPayment.getScript()}</script>
      </body>
    </html>`
  );
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      order: order._id,
    },
  });
};

exports.verifyOrder = async (req, res, next) => {
  const Authority = req.query.Authority;
  console.log(Authority);
  const order = await Order.findOne({
    "paymentInfo.referenceId": Authority,
  });

  try {
    console.log(order);
    console.log(order.paymentInfo.totalPrice);
    console.log(order.paymentInfo.referenceId);

    // const testrReceipt = await zarinpal.verifyPayment();
    let receipt = await zarinpal.verifyPayment(
      {
        amount: order.paymentInfo.totalPrice,
        referenceId: order.paymentInfo.referenceId,
      },
      { ...req.params, ...req.body }
    );
    console.log(receipt);
    res.send(receipt);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
  // const orderId = req.body.orderId;
  // const order = await Order.findByIdAndUpdate(
  //   orderId,
  //   {
  //     $inc: { status: 1 },
  //   },
  //   { new: true }
  // );
  // transporter.sendMail({
  //   from: '"👻فروشگاه اینترنتی میوه خشک پَم پَم👻" <support@pam-pam.ir>',
  //   to: req.user.email,
  //   subject: "فاکتور خرید",
  //   html: `<div>
  //     <h1>فروشگاه اینترنتی میوه خشک پَم پَم pam-pam.ir</h1>
  //     <h2>فاکتور خرید</h2>
  //     <h4>کد پیگیری : ${order.paymentInfo.shopTrackingCode}</h4>
  //     <h6>${order.products}</h6>
  //     <p>ازینکه فروشگاه مارو انتخاب کردید از شما سپاسگذاریم!</p>
  //     </div>`,
  // });
  // await User.findByIdAndUpdate(req.user._id, {
  //   cart: [],
  // });
  // const products = order.products;
  // for (const product of products) {
  //   await Product.findByIdAndUpdate(product._id, {
  //     $inc: { count: -product.quantity },
  //   });
  // }
  // res.send(order);
};

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

exports.getOrderForm = (req, res, next) => {
  res.render("client/orderForm");
};
