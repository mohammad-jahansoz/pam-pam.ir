module.exports = async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    req.flash(
      "message",
      "برای دسترسی به این بخش ابتدا باید وارد اکانت خود شوید!اگر اکانت ندارید ثبت نام کنید."
    );
    res.redirect("/api/auth/signin");
  }
};
