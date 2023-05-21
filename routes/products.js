const express = require("express");
const router = express.Router();
const productsController = require("../controller/products");
const userController = require("../controller/user");

router.post(
  "/api/product/getProducts/:category",
  productsController.getProducts
);
router.get(
  "/api/product/getProducts/:category",
  productsController.getProducts
);
router.get("/api/product/getCart", userController.getCart);
router.put("/api/product/like/:id", productsController.setLike);
router.post("/api/product/comment/:id", productsController.setComment);
router.post("/api/product/addToCart", userController.addToCart);
// router.put("/api/product/setOrder", userController.setOrder);
router.get("/api/product/verifyOrder", userController.verifyOrder);
router.post("/api/product/search", productsController.searchProducts);
router.get("/api/product/getProduct/:id", productsController.getProduct);
router.get(
  "/api/product/deleteCartItem/:productId",
  userController.deleteCartItem
);
router.get("/api/user/getOrderForm", userController.getOrderForm);
router.post("/api/user/orderForm", userController.setOrder);
router.get("/api/user/getOrders", userController.getOrders);

module.exports = router;
