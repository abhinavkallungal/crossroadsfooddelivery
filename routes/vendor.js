var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const vendorHelpers = require("../helpers/vendor-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.vendorLoggedIn) {
    next();
  } else {
    res.redirect("/vendor/login");
    next();
  }
};

/* GET home page. */
router.get("/", verifyLogin, function (req, res, next) {
  vendordetails=req.session.vendor;
  res.render("vendor/dashboard", { vendordetails,vendor: true});
});

router.get("/login", (req, res) => {
  if (req.session.vendorLoggedIn) {
    res.redirect("/vendor");
  } else {
    res.render("vendor/vendor-login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post("/login", (req, res) => {
  vendorHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.vendorLoggedIn = true;
      req.session.vendor = response.user;
      res.redirect("/vendor");
      console.log("logedin");
    } else {
      req.session.loginErr = true;
      res.redirect("/vendor/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.vendorLoggedIn=false;
  req.session.vendor=null
  res.redirect("/vendor/login");
});

router.get("/products", verifyLogin, function (req, res) {
  VendorId=req.session.vendor._id;
  productHelpers.getVendorProducts(VendorId).then((products) => {
    let tiltes = [{ title: "vendor " }];
    let css = [{ css: "/stylesheets/product-management.css" }];
    let scripts = [{ script: "/javascripts/vendordash.js" }];
    res.render("vendor/view-products", { products,vendor: true, scripts, css, tiltes });
  });
});

router.get("/add-product", verifyLogin, function (req, res) {
  vendordetails=req.session.vendor;
  vendorHelpers.getAllCategorys().then((categorys) => {
    let tiltes = [{ title: "vendor " }];
    let css = [{ css: "/stylesheets/product-management.css" }];
    let scripts = [{ script: "/javascripts/vendordash.js" }];
    res.render("vendor/add-product", {vendordetails, categorys,vendor: true, scripts, css, tiltes });
  });
});


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
router.get("/orders",verifyLogin,async(req,res)=>{
  let css = [{ css: "/stylesheets/product-management.css" }];
  let scripts = [{ script: "/javascripts/vendordash.js" }];
  console.log(req.session.vendor._id);
  orders=await vendorHelpers.getVendorsOrder(req.session.vendor._id)
  res.render("vendor/order", {  orders,scripts, css,vendor: true })
});
router.get("/vieworder/:id",verifyLogin,async(req,res)=>{
  let css = [{ css: "/stylesheets/product-management.css" }];
  let scripts = [{ script: "/javascripts/vendordash.js" }];
  console.log(req.session.vendor._id);
  let orderId=req.params.id
  order=await vendorHelpers.getOrderDetails(orderId,req.session.vendor._id)
  res.render("vendor/each-order-view", { order,scripts, css,vendor: true })
});
router.post("/changestatus",(req,res)=>{
  console.log(req.body);
  let  status = req.body.status
  let orderId =req.body.orderId
  vendorHelpers.updateOrderStatus(orderId,status, req.session.vendor._id).then(() => {
    res.redirect("/vendor/products");
    let id = req.params.id;
    
  });
})

router.get("/sales",verifyLogin,async (req,res)=>{
  let css = [{ css: "/stylesheets/product-management.css" }];
  let scripts = [{ script: "/javascripts/vendordash.js" }];
  let sales = await vendorHelpers.getSalesReport(req.session.vendor._id)
  res.render("vendor/sales", {vendor:true,sales,css,scripts});
});


module.exports = router;
