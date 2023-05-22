require("dotenv").config();
require("winston-mongodb");
require("express-async-errors");
require("./startup/db")();

const express = require("express");
const app = express();
const adminRoutes = require("./routes/admin");
const Product = require("./models/product");
const productsRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const checkUser = require("./middleware/checkUser");
const error = require("./middleware/error");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const userController = require("./controller/user");
const flash = require("connect-flash");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "view");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/pam-pam",

      ttl: 60 * 60 * 24 * 365,
    }),
  })
);
app.use(flash());

app.use(checkUser);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get("/receipt", userController.designOrder);
app.use(productsRoutes);
app.use(authRoutes);
app.use(error);

app.get("/", async (req, res) => {
  const products = await Product.find().limit(4);
  res.render("client/index", { products });
});

app.use("/admin", adminRoutes);

app.use((req, res, next) => {
  res.status(404).send("mistake url . 404 page not found");
});

app.listen(3000, () => {
  console.log("app running on port 3000");
});
