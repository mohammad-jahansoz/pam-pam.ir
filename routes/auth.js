const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

router.get("/api/auth/signin", authController.getSignin);
router.get("/api/auth/signup", authController.getSignup);
router.post("/api/auth/signup", authController.postSignUp);
router.post("/api/auth/signin", authController.postSignIn);
router.post(
  "/api/auth/resetPassword",
  authController.sendPasswordRecoveryEmail
);
// router.put(
//   "/api/auth/resetPassword/:email/:token",
//   authController.setNewPassword
// );
router.get(
  "/api/auth/resetPassword/:email/:token",
  authController.verifyPasswordRecoveryEmail
);
router.get("/api/auth/logout", authController.logout);
// we dont need api for logout , this happen by front-end by delete x-auth-token in Header
module.exports = router;
