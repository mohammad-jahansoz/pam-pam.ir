const { mongoose } = require("mongoose");
const Product = require("../models/product");
exports.getProduct = async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(200).send("you send invelid id , ply try again");
  }

  const product = await Product.findById(productId).populate(
    "relatedProduct",
    "name price _id imageUrl"
  );
  console.log(product);
  if (!product)
    return res.status(404).send(`we havent any product with ${productId} id`);
  res.render("client/product", { product });
  // fire and run => first send response to client after query to database.
  await Product.updateOne(
    { _id: new mongoose.Types.ObjectId(productId) },
    {
      $push: { views: new Date().toISOString() },
    }
  );
};

exports.setLike = async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send("you send invalid id , ply try again");
  }
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        likes: new Date().toISOString(),
      },
    },
    { new: true }
  );
  console.log(product.name, product.likes);
  res.send(product.likes);
};

exports.setComment = async (req, res, next) => {
  const { name, email, comment } = req.body;
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send("you send invalid id , pls try again");
  }
  await Product.findByIdAndUpdate(productId, {
    $push: {
      comments: {
        comment: {
          name: name,
          email: email,
          comment: comment,
          createdAt: new Date().toISOString(),
        },
      },
    },
  });
  res.redirect(`/api/product/getProduct/${productId}`);
};

exports.searchProducts = async (req, res, next) => {
  const searchedText = req.body.searchedText;
  const products = await Product.find({
    $text: { $search: searchedText },
  }).select("_id name imageUrl count price category");
  console.log(products);
  res.send(products);
};

exports.getProducts = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const search = req.body.search || req.query.search || "";
  const category = req.params.category === "all" ? "" : req.params.category;

  let sortBy = req.query.sort || "createdAt";
  let products;
  if (sortBy === "createdAt" || sortBy === "price") {
    products = await Product.paginate(
      {
        name: { $regex: search },
        category: { $regex: category },
      },
      { limit: limit, page: page, sort: [[sortBy, -1]] }
    );
  } else if (sortBy === "views" || sortBy === "likes") {
    const aggregate = Product.aggregate();
    aggregate.match({
      name: { $regex: search },
      category: { $regex: category },
    });
    aggregate.project({
      _id: 1,
      imageUrl: 1,
      name: 1,
      price: 1,
      sale: 1,
      category: 1,
      count: 1,
      viewsSize: { $size: `$${sortBy}` },
    });
    const option = {
      page: page,
      limit: limit,
      sort: { viewsSize: -1 },
    };

    products = await Product.aggregatePaginate(aggregate, option);
  }

  res.render("client/products", {
    products: products.docs,
    search,
    category,
    sortBy,
    pagination: {
      totalProducts: products.totalDocs,
      totalPages: products.totalPages,
      hasNextPage: products.hasNextPage,
      hasPrevPage: products.hasPrevPage,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
    },
  });
};
