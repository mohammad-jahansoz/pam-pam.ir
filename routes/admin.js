const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin");
const isAdmin = require("../middleware/isAdmin");

router.get("/api/products", isAdmin, adminController.getProducts);
router.post("/api/product", adminController.addProduct);
router.delete("/api/product/:id", isAdmin, adminController.removeProduct);
router.put("/api/product/:id", isAdmin, adminController.updateProduct);
router.get("/api/products/comments", isAdmin, adminController.getComments);
router.get(
  "/api/product/comments/:id",
  isAdmin,
  adminController.getCommentsOfSingleProduct
);
router.put(
  "/api/product/comment/:productId/:commentId",
  isAdmin,
  adminController.setReply
);
router.delete(
  "/api/product/comment/:productId/:commentId",
  isAdmin,
  adminController.deleteComment
);
router.post("/api/order/search", isAdmin, adminController.searchOrder);

module.exports = router;
