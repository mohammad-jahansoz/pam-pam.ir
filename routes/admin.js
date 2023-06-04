const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");

router.get("/products", adminController.getProducts);
router.get("/addProduct", adminController.getAddProduct);
router.post("/addProduct", adminController.addProduct);
router.get("/deleteProduct/:id", adminController.deleteProduct);
router.post("/product/:id", adminController.postEditProduct);
router.get("/product/:id", adminController.getEditProduct);
router.get("/products/comments", adminController.getComments);
router.get(
  "/product/comments/:id",

  adminController.getCommentsOfSingleProduct
);
router.post(
  "/product/comment/:productId/:commentId",

  adminController.setReply
);
router.get("/orders", adminController.getOrders);
router.get(
  "/product/comment/:productId/:commentId",
  adminController.deleteComment
);
router.post("/api/order/search", adminController.searchOrder);
router.get("/signin", adminController.getSignIn);
router.post("/orders/:orderId", adminController.postEditOrder);
router.get("/order/:orderId", adminController.getOrder);

module.exports = router;
