const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const zarinpal_checkout = require("zarinpal-checkout");
const Off = require("../models/off");

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
  const response = await req.user.addToCart(productId, +quantity);
  res.json({ tekrari: response });
  res.end();
};

exports.getCart = async (req, res, next) => {
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -views -likes -comments -createdAt -updatedAt -__v"
  );

  res.render("client/cart", {
    cart: userWithProductsInCart.cart,
    path: "cart",
    postPrice: +process.env.POST_PRICE,
  });
};

exports.updateOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  const order = await Order.findById(orderId);

  const payment = await zarinpal.PaymentRequest({
    Amount: order.paymentInfo.totalPrice,
    CallbackURL: "http://127.0.0.1:3000/api/product/verifyOrder",
    Description: "خرید از فروشگاه اینترنتی پم پم - PAM-PAM.IR",
    Email: req.user.email,
  });
  if (payment.status === 100) {
    res.redirect(payment.url);
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        user: {
          name: req.body.name,
          email: req.user.email,
          phoneNumber: req.body.phoneNumber,
          address: {
            province: req.body.province,
            city: req.body.city,
            address: req.body.address,
            postCode: req.body.postCode,
          },
        },
        note: req.body.note,
        paymentInfo: {
          offCode: order.paymentInfo.offCode,
          offPercent: order.paymentInfo.offPercent,
          totalPrice: order.paymentInfo.totalPrice,
          shopTrackingCode: order.paymentInfo.shopTrackingCode,
          referenceId: payment.authority,
        },
      },
    });
    // await Order.findByIdAndUpdate(orderId, {
    //   $set: {
    //     user: {
    //       name: req.body.name,
    //       email: req.user.email,
    //       phoneNumber: req.body.phoneNumber,
    //       address: {
    //         province: req.body.province,
    //         city: req.body.city,
    //         address: req.body.address,
    //         postCode: req.body.postCode,
    //       },
    //     },
    //     note: req.body.note,
    //     paymentInfo: {
    //       offCode: order.paymentInfo.offCode,
    //       offPercent: order.paymentInfo.offPercent,
    //       totalPrice: order.paymentInfo.totalPrice,
    //       shopTrackingCode: order.paymentInfo.shopTrackingCode,
    //       referenceId: payment.authority,
    //     },
    //   },
    // });
  } else {
    res.send("لطفا دقایقی دیگر مجددا تلاش کنید!");
  }
};

exports.setOrder = async (req, res, next) => {
  const offCode = req.body.offCode;
  const userWithProductsInCart = await req.user.populate(
    "cart.productId",
    "-relatedProduct -category -views -likes -comments -createdAt -updatedAt -__v "
  );

  const off = await Off.findOne({ code: offCode });
  let totalPrice = +process.env.POST_PRICE;
  for (const product of userWithProductsInCart.cart) {
    totalPrice +=
      ((product.productId.price * product.quantity) / 100) *
      (100 - product.productId.off);
  }

  if (off) {
    totalPrice = (totalPrice / 100) * (100 - off.percent);
  }

  const shopTrackingCode = Math.floor(100000 + Math.random() * 900000);

  const order = new Order({
    user: {
      _id: req.user._id,
      email: req.user.email,
    },
    products: userWithProductsInCart.cart,
    paymentInfo: {
      offCode: off ? off.code : "",
      offPercent: off ? off.percent : 0,
      totalPrice: totalPrice,
      shopTrackingCode: shopTrackingCode,
    },
  });

  await order.save();
  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      order: order._id,
    },
  });
  res.render("client/orderForm", {
    orderId: order._id,
    totalPrice: order.paymentInfo.totalPrice,
  });
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
      await Off.updateOne(
        { code: order.paymentInfo.offCode },
        { $inc: { count: -1 } }
      );
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

exports.getOrders = async (req, res, next) => {
  const userWithOrders = await req.user.populate({
    path: "order",
    options: { sort: { createdAt: -1 } },
  });

  res.render("client/getOrders", {
    orders: userWithOrders.order,
    path: "orders",
  });
};

exports.downloadReceipt = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);
  let browser;
  browser = await puppeteer.launch({ headless: "new" });
  const [page] = await browser.pages();
  const html = await ejs.renderFile(`${__dirname}/../view/client/invoice.ejs`, {
    order,
  });
  // res.render("client/invoice", { order });
  await page.setContent(html);
  const pdf = await page.pdf({ format: "A4" });
  res.contentType("application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
  res.send(pdf);
  page.close();
};

exports.verifyOffCode = async (req, res, next) => {
  const offCode = req.body.offCode;
  const code = await Off.findOne({ code: offCode });
  if (code && code.count > 0) {
    res.json({
      code: offCode,
      percent: code.percent,
    });
  } else {
    res.json(false);
  }
  res.end();
};
