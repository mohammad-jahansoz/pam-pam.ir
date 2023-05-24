const express = require("express");
const router = express.Router();
const productsController = require("../controller/products");
const userController = require("../controller/user");
const isAuth = require("../middleware/isAuth");

router.post(
  "/api/product/getProducts/:category",
  productsController.getProducts
);
router.get(
  "/api/product/getProducts/:category",
  productsController.getProducts
);
router.get("/api/product/getCart", isAuth, userController.getCart);
router.put("/api/product/like/:id", productsController.setLike);
router.post("/api/product/comment/:id", productsController.setComment);
router.post("/api/product/addToCart", isAuth, userController.addToCart);
// router.put("/api/product/setOrder", userController.setOrder);
router.get("/api/product/verifyOrder", isAuth, userController.verifyOrder);
router.post("/api/product/search", productsController.searchProducts);
router.get("/api/product/getProduct/:id", productsController.getProduct);
router.get(
  "/api/product/deleteCartItem/:productId",
  isAuth,
  userController.deleteCartItem
);
router.get("/api/user/getOrderForm", isAuth, userController.getOrderForm);
router.post("/api/user/orderForm", isAuth, userController.setOrder);
router.get("/api/user/getOrders", isAuth, userController.getOrders);
router.get(
  "/api/user/downloadReceipt/:orderId",
  isAuth,
  userController.downloadReceipt
);

module.exports = router;
