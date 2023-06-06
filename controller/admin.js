const mongoose = require("mongoose");
const objectId = mongoose.Types.ObjectId;
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Upload = require("../models/uploads");

exports.getEditProduct = async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  res.render("admin/editProduct", { product });
};

exports.postEditProduct = async (req, res, next) => {
  const productId = req.params.id;
  const sale = req.body.sale;
  const name = req.body.name;
  const count = req.body.count;
  const details = req.body.details;
  const category = req.body.category;
  const relatedProduct1 = req.body.relatedProduct1;
  const relatedProduct2 = req.body.relatedProduct2;
  const relatedProduct3 = req.body.relatedProduct3;
  const relatedProduct4 = req.body.relatedProduct4;
  const price = req.body.price;
  const imageUrl1 = req.body.imageUrl1;
  const imageUrl2 = req.body.imageUrl2;
  const imageUrl3 = req.body.imageUrl3;
  const imageUrl4 = req.body.imageUrl4;
  const relatedProductsBody = [
    relatedProduct1,
    relatedProduct2,
    relatedProduct3,
    relatedProduct4,
  ];
  let relatedProducts = [];
  for (const p of relatedProductsBody) {
    if (objectId.isValid(p)) {
      relatedProducts.push(p);
    }
  }

  await Product.findByIdAndUpdate(productId, {
    name: name,
    category: category,
    relatedProduct: relatedProducts,
    sale: sale,
    price: price,
    details: details,
    imageUrl: [imageUrl1, imageUrl2, imageUrl3, imageUrl4],
    count: count,
  });

  res.redirect("/admin/products");
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/addProduct");
};

exports.addProduct = async (req, res, next) => {
  const sale = req.body.sale;
  const name = req.body.name;
  const count = req.body.count;
  const details = req.body.details;
  const category = req.body.category;
  const relatedProduct1 = req.body.relatedProduct1;
  const relatedProduct2 = req.body.relatedProduct2;
  const relatedProduct3 = req.body.relatedProduct3;
  const relatedProduct4 = req.body.relatedProduct4;
  const price = req.body.price;
  const imageUrl1 = req.body.imageUrl1;
  const imageUrl2 = req.body.imageUrl2;
  const imageUrl3 = req.body.imageUrl3;
  const imageUrl4 = req.body.imageUrl4;
  const relatedProductsBody = [
    relatedProduct1,
    relatedProduct2,
    relatedProduct3,
    relatedProduct4,
  ];
  let relatedProducts = [];
  for (const p of relatedProductsBody) {
    if (objectId.isValid(p)) {
      relatedProducts.push(p);
    }
  }

  const product = new Product({
    name: name,
    details: details,
    category: category,
    count: count,
    sale: sale,
    relatedProduct: relatedProducts,
    price: price,
    imageUrl: [imageUrl1, imageUrl2, imageUrl3, imageUrl4],
  });
  await product.save();
  res.redirect("/admin/products");
};

exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    return res.status(404).send("havent any product with this id");
  }
  res.redirect("/admin/products");
};

exports.getComments = async (req, res, next) => {
  const products = await Product.find();
  let comments = [];
  for (let product of products) {
    for (let comment of product.comments) {
      comments.push({ productId: product._id, comment });
    }
  }

  const commentsSortByDate = comments.sort((a, b) => {
    return (
      new Date(b.comment.comment.createdAt) -
      new Date(a.comment.comment.createdAt)
    );
  });
  res.render("admin/getComments", { comments: commentsSortByDate });
};

exports.getCommentsOfSingleProduct = async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  const comments = [];
  for (const comment of product.comments) {
    comments.push({ productId: product._id, comment });
  }
  const commentsSortByDate = comments.sort((a, b) => {
    return (
      new Date(b.comment.comment.createdAt) -
      new Date(a.comment.comment.createdAt)
    );
  });

  res.render("admin/getComments", {
    comments: commentsSortByDate,
  });
};

exports.setReply = async (req, res, next) => {
  const commentId = req.params.commentId;
  const productId = req.params.productId;
  const comment = req.body.comment;
  const reply = req.body.reply;
  console.log(reply);
  await Product.updateOne(
    {
      _id: new objectId(productId),
      "comments._id": new objectId(commentId),
    },
    {
      $set: {
        "comments.$.comment.comment": comment,
        "comments.$.reply": reply,
      },
    }
  );

  res.redirect("/admin/products/comments");
};

exports.deleteComment = async (req, res, next) => {
  const productId = req.params.productId;
  const commentId = req.params.commentId;

  await Product.findByIdAndUpdate(productId, {
    $pull: {
      comments: {
        _id: new objectId(commentId),
      },
    },
  });
  res.redirect("/admin/products/comments");
};

exports.getProducts = async (req, res, next) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render("admin/products", { products });
};

exports.searchOrder = async (req, res, next) => {
  const searchedText = req.body.searchedText;
  if (typeof searchedText === "string") {
    const order = await Order.find({
      $text: { $search: searchedText },
    });
    console.log(order);
    res.send(order);
  } else if (typeof searchedText === "number") {
    const order = await Order.find({
      "paymentInfo.shopTrackingCode": searchedText,
    });
    console.log(order);
    res.send(order);
  }
};

exports.getOrders = async (req, res, next) => {
  const orders = await Order.find();
  // console.log(orders);
  res.render("admin/orders", { orders: orders });
};

exports.getSignIn = (req, res, next) => {
  res.render("admin/signIn");
};

exports.postEditOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  const { postTrackingCode, status } = req.body;
  await Order.findByIdAndUpdate(orderId, {
    $set: {
      status: status,
      "paymentInfo.postTrackingCode": postTrackingCode,
    },
  });
  res.redirect("/admin/orders");
};

exports.getOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);
  res.render("admin/order", { order });
};

exports.getUpload = (req, res, next) => {
  res.render("admin/upload");
};

exports.postUpload = async (req, res, next) => {
  const upload = new Upload({ url: "/" + req.file.path, type: req.body.type });
  await upload.save();
  res.redirect("/admin/upload");
};
