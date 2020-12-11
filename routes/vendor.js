var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const vendorHelpers = require("../helpers/vendor-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/vendor/login");
    next();
  }
};

/* GET home page. */
router.get("/", verifyLogin, function (req, res, next) {
  vendordetails=req.session.user;
  let tiltes = [{ title: "vendor " }];
  let css = [{ css: "stylesheets/admindash.css" }];
  let scripts = [
    { script: "javascripts/vendordash.js" },
    { script: "https://cdn.jsdelivr.net/npm/chart.js@2.8.0" },
  ];
  res.render("vendor/dashboard", { vendordetails,vendor: true, scripts, css, tiltes });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/vendor");
  } else {
    res.render("vendor/vendor-login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post("/login", (req, res) => {
  vendorHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/vendor");
      console.log("logedin");
    } else {
      req.session.loginErr = true;
      res.redirect("/vendor/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/vendor/login");
});

router.get("/products", verifyLogin, function (req, res) {
  VendorId=req.session.user._id;
  
  productHelpers.getAllProducts(VendorId).then((products) => {
    let tiltes = [{ title: "vendor " }];
    let css = [{ css: "/stylesheets/product-management.css" }];
    let scripts = [{ script: "/javascripts/vendordash.js" }];
    res.render("vendor/view-products", { products,vendor: true, scripts, css, tiltes });
  });
});

router.get("/add-product", verifyLogin, function (req, res) {
  vendordetails=req.session.user;
  vendorHelpers.getAllCategorys().then((categorys) => {
    let tiltes = [{ title: "vendor " }];
    let css = [{ css: "/stylesheets/product-management.css" }];
    let scripts = [{ script: "/javascripts/vendordash.js" }];
    res.render("vendor/add-product", {vendordetails, categorys,vendor: true, scripts, css, tiltes });
  });
});
router.post("/imgupload", (req,res)=>{

})

router.post("/add-product",  (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/vendor/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/vendor/products");
  });
});

router.get("/edit-product/:id", async (req, res) => {
    let tiltes = [{ title: "vendor " }];
    let css = [{ css: "/stylesheets/product-management.css" }];
    let scripts = [{ script: "/javascripts/vendordash.js" }];
    let product = await productHelpers.getProductDetails(req.params.id);
    let categorys =await vendorHelpers.getAllCategorys()
  console.log(product);
  res.render("vendor/edit-product", { product,categorys,vendor: true, scripts, css, tiltes });
});
router.post("/edit-product/:id", (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/vendor/products");
    let id = req.params.id;
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});

module.exports = router;
