const express = require("express");
const router = express.Router();

router.get("/contactus", (req, res, next) => {
  res.render("client/contactus");
});
router.get("/aboutUs", (req, res, next) => {
  res.render("client/aboutUs");
});

module.exports = router;
