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
const general = require("./controller/general");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/upload/",
  express.static(path.join(__dirname, "public", "upload"))
);
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
  res.locals.search = "";
  res.locals.path = "";
  res.locals.user = req.user;
  next();
});

app.use(productsRoutes);
app.use(authRoutes);
app.use(general);

app.get("/", async (req, res) => {
  const products = await Product.find().limit(4);
  res.render("client/index", { products, path: "home" });
});

app.use("/admin", adminRoutes);

app.use(error.error);
app.use(error.error404);

app.listen(3000, () => {
  console.log("app running on port 3000");
});
