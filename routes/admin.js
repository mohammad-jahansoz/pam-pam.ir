const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");

router.get("/products", adminController.getProducts);
router.get("/addProduct", adminController.getAddProduct);
router.post("/allProduct", adminController.addProduct);
router.get("/deleteProduct/:id", adminController.deleteProduct);
router.put("/api/product/:id", adminController.updateProduct);
router.get("/api/products/comments", adminController.getComments);
router.get(
  "/api/product/comments/:id",

  adminController.getCommentsOfSingleProduct
);
router.put(
  "/api/product/comment/:productId/:commentId",

  adminController.setReply
);
router.delete(
  "/api/product/comment/:productId/:commentId",

  adminController.deleteComment
);
router.post("/api/order/search", adminController.searchOrder);
router.get("/signin", adminController.getSignIn);

module.exports = router;
