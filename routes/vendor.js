var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const vendorHelpers = require("../helpers/vendor-helpers");
const { response } = require("express");

const verifyLogin = (req, res, next) => {
  if (req.session.vendorLoggedIn) {
    next();
  } else {
    res.redirect("/vendor/login");
    next();
  }
};

/* GET home page. */
router.get("/", verifyLogin,async(req, res, next)=> {
  vendordetails=req.session.vendor;
  vendorId= req.session.vendor._id;
  let todayEarnings = await vendorHelpers.todayEarnings(vendorId)
  let thisMonthEarnings=await vendorHelpers.thisMonthEarnings(vendorId)
  let totalEarnings = await vendorHelpers.totalEarnings(vendorId)
  let totalOrder=await vendorHelpers.totalOrder(vendorId)
  let getSalesReport=await vendorHelpers.getSalesReport(vendorId)
  res.render("vendor/dashboard", {vendor: true,vendorId,todayEarnings,totalEarnings,totalOrder,thisMonthEarnings,getSalesReport});
});

router.get("/chartData/:id",verifyLogin,async(req,res)=>{
  vendorId=req.params.id;
  let bestSelling= await vendorHelpers.getBestSellingProducts(vendorId);
   response.BSPlabel = bestSelling.map( item => item.product)
   response.BSPdata = bestSelling.map( item => item.total)
   let daysales=await vendorHelpers.getDaySales(vendorId);
   response.DSlabel= daysales.map( item => item._id)
   response.DSdata = daysales.map( item => item.total)
  console.log("calltest")
  res.json(response)
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


router.get("/profile",verifyLogin,async(req,res)=>{
  let vendorId= req.session.vendor._id;
   let VendorsDetail = await vendorHelpers.getVendorsDetail(vendorId);
  console.log(VendorsDetail);
res.render("vendor/profile",{vendor: true,VendorsDetail})
});
router.post("/updateprofile/:id",verifyLogin,async(req,res)=>{
  vendorId=req.params.id;
  vendorData= req.body;
  await vendorHelpers.updateProfile(vendorId,vendorData).then((response)=>{
    res.redirect("/vendor/")
  })
});

router.get("/resetpassword",verifyLogin,async (req,res)=>{
  let vendorId= req.session.vendor._id;
  let VendorsDetail = await vendorHelpers.getVendorsDetail(vendorId);
  res.render("vendor/resetpassword",{vendor: true,vendorId,VendorsDetail})
 
});

router.post("/resetpassword/:id",verifyLogin,async(req,res)=>{
  let vendorId= req.session.vendor._id;
  oldPassword=req.body.oldPassword,
  newPassword=req.body.Password
 await vendorHelpers.checkPassword(vendorId,oldPassword).then(async(response)=>{
   if(response.status){
    console.log(response.status);
    await vendorHelpers.resetPassword(vendorId,newPassword).then((response)=>{
      res.redirect("/vendor/profile")
    })
   }else{
    console.log(response.status);
    passwordErr=true;
    res.redirect("/admin/resetpassword")
   }
 })
  res.redirect("/admin/resetpassword")
});



router.get("/products", verifyLogin, function (req, res) {
  VendorId=req.session.vendor._id;
  productHelpers.getVendorProducts(VendorId).then((products) => {
    let tiltes = [{ title: "vendor " }];
   
    res.render("vendor/view-products", { products,vendor: true,tiltes });
  });
});

router.get("/add-product", verifyLogin, function (req, res) {
  vendordetails=req.session.vendor;
  vendorHelpers.getAllCategorys().then((categorys) => {
    let tiltes = [{ title: "vendor " }];
    
    res.render("vendor/add-product", {vendordetails, categorys,vendor: true,  tiltes });
  });
});


router.post("/add-product",  (req, res) => {
  req.body.Price=parseInt(req.body.Price)
  req.body.Status = "Active";
  
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
   
    let product = await productHelpers.getProductDetails(req.params.id);
    let categorys =await vendorHelpers.getAllCategorys()
  console.log(product);
  res.render("vendor/edit-product", { product,categorys,vendor: true,  tiltes });
});
router.post("/edit-product/:id", (req, res) => {
  req.body.Price=parseInt(req.body.Price)
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
 
  console.log(req.session.vendor._id);
  orders=await vendorHelpers.getVendorsOrder(req.session.vendor._id)
  res.render("vendor/order", {  orders,vendor: true })
});
router.get("/vieworder/:id",verifyLogin,async(req,res)=>{
 
  console.log(req.session.vendor._id);
  let orderId=req.params.id
  order=await vendorHelpers.getOrderDetails(orderId,req.session.vendor._id)
  Orderproducts= await vendorHelpers.getOrderproducts(orderId,req.session.vendor._id)
  res.render("vendor/each-order-view", { order,vendor: true,Orderproducts })
});
router.post("/changestatus",(req,res)=>{
  console.log(req.body);
  let  status = req.body.status
  let orderId =req.body.orderId
  vendorHelpers.updateOrderStatus(orderId,status, req.session.vendor._id).then(() => {
    
    res.redirect("/vendor/orders");
   
  });
})

router.get("/sales",verifyLogin, (req,res)=>{
  res.render("vendor/sales", {vendor:true});
});

router.get("/salesdata",verifyLogin,async(req,res)=>{
  let vendorId=req.session.vendor._id
  response.salesReport = await vendorHelpers.getSalesReport(vendorId)
  res.json(response)
})

router.get("/salesfilter/:filter",verifyLogin,async(req,res)=>{
  console.log("call test");
  let filter =req.params.filter
  let vendorId=req.session.vendor._id
   if(filter ==="Today"){
    response.salesReport= await vendorHelpers.getThisDaySalesReport(vendorId);
   }else if(filter ==="ThisMonth"){
    response.salesReport= await vendorHelpers.getThisMonthSalesReport(vendorId);
   }else if(filter ==="All"){
    response.salesReport= await vendorHelpers.getSalesReport(vendorId);
   }
  
  res.json(response)
});

router.get("/test",verifyLogin,async(req,res)=>{
  vendorId=req.session.vendor._id
  await vendorHelpers.getOrderproducts(vendorId)
  
})


module.exports = router;
