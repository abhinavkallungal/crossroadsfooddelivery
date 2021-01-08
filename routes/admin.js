var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helpers");
const { response } = require("express");
var moment = require('moment')

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect("/admin/login")
    next()
  }
};

/* GET users listing. */
router.get("/", verifyLogin,async (req, res) =>{
  let salesReport= await adminHelpers.getSalesReport();
  let todaySales=await adminHelpers.todaySales();
  let thisMonhtSales=await adminHelpers.thisMonthSales();
  let totalEarnings=await adminHelpers.totalEarnings();
  let totalOrder= await adminHelpers.totalOrder();
  res.render("admin/dashboard", { admin: true,salesReport,totalOrder,totalEarnings,thisMonhtSales,todaySales})
});

router.get("/chartData",verifyLogin,async(req,res)=>{
  let bestSelling= await adminHelpers.getBestSellingProducts();
   response.BSPlabel = bestSelling.map( item => item.product)
   response.BSPdata = bestSelling.map( item => item.total)
   let daysales=await adminHelpers.getDaySales();
   response.DSlabel= daysales.map( item => item._id)
   response.DSdata = daysales.map( item => item.total)
   response.salesReport= await adminHelpers.getSalesReport();
  console.log("calltest")
  res.json(response)
});

// router.get('/signup',(req, res)=> {
//   res.render('admin/signup')

// });
// router.post('/signup',(req, res)=> {
//   adminHelpers.doSignup(req.body).then((response)=>{
//      req.session.adminLoggedIn=true
//      req.session.user=response
//      res.redirect('/')
//    })

// });
router.get("/login", (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.user;
      res.redirect("/admin");
      console.log("logedin");
    } else {
      req.session.loginErr = true;
      res.redirect("/admin/login");
    }
  })
});

router.get("/logout", (req, res) => {
  req.session.adminLoggedIn=false;
  res.redirect("/admin/login");
});


router.get("/profile",verifyLogin,(req,res)=>{
  let admindata= req.session.admin
res.render("admin/profile",{admindata})
});
router.post("/updateprofile/:id",verifyLogin,async(req,res)=>{
  adminId=req.params.id;
  adminData= req.body;
  await adminHelpers.updateProfile(adminId,adminData).then((response)=>{
    res.redirect("/admin/")
  })
});

router.get("/resetpassword",verifyLogin,(req,res)=>{
  adminId=req.session.admin._id
  admindata= req.session.admin
  res.render("admin/resetpassword",{adminId,admindata})
 
});

router.post("/resetpassword/:id",verifyLogin,async(req,res)=>{
  adminId=req.params.id
  oldPassword=req.body.oldPassword,
  newPassword=req.body.Password
 await adminHelpers.checkPassword(adminId,oldPassword).then((response)=>{
   if(response.status){
    console.log(response.status);
     adminHelpers.resetPassword(adminId,newPassword).then((response)=>{
      res.redirect("/admin/profile")
    })
   }else{
    console.log(response.status);
    passwordErr=true;
    res.redirect("/admin/resetpassword")
   }
 })
  res.redirect("/admin/resetpassword")
});

router.get("/add-product", function (req, res) {
  res.render("admin/add-product");
});

router.post("/add-product",verifyLogin, (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product");
      } else {
        console.log(err);
      }
    })
  })
});
router.get("/view-users",verifyLogin,(req,res)=>{
  adminHelpers.getAllUsers().then((users) => {
    res.render("admin/view-users", {admin:true, users});
  })
});
router.get("/add-users", verifyLogin, (req, res) => {
  res.render("admin/add-user", { admin: true ,"nameErr":req.session.nameErr });
  req.session.nameErr = false
});

router.post("/add-users",verifyLogin, (req, res) => {
  req.body.MobileNo = "+91"+req.body.MobileNo
  adminHelpers.addUser(req.body).then((response) => {
    if (response.status) {
      req.session.emailErr = true;
      res.redirect("/admin/add-users");
    } else {
      console.log(response);
      res.redirect("/admin/view-users");
    }
  });
});
router.get("/edit-users/:id", verifyLogin, async (req, res) => {
  let userDetails = await adminHelpers.editUsers(req.params.id);
  console.log(userDetails);
 
  res.render("admin/edit-users", { admin: true,  userDetails });
});

router.post("/edit-users/:id",verifyLogin, (req, res) => {
  adminHelpers.updateUser(req.params.id, req.body).then(() => {
    res.redirect("/admin/view-users");
  })
});

router.get("/view-vendors", verifyLogin, (req, res) => {
  adminHelpers.getAllVendors().then((vendors) => {
    res.render("admin/view-vendors", {admin:true, vendors});
  })
});

router.get("/add-vendor", verifyLogin, (req, res) => {
  adminHelpers.addVendor(req.body).then((response) => {
    console.log(response);
  })
 
  res.render("admin/add-vendor", { admin: true ,"nameErr":req.session.nameErr });
  req.session.nameErr = false
});

router.post("/add-vendor",verifyLogin, async (req, res) => {
   await adminHelpers.addVendor(req.body).then((response) => {
    let logo = req.files.logo;
    let id =response[0]._id
    console.log(response);
    if(response.status){
      console.log("test1");
      req.session.nameErr=true
      res.redirect('/admin/add-vendor')
    }else{
      console.log("test2",id);
      logo.mv("./public/vendor-logo/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect('/admin/view-vendors');
      } else {
        console.log(err);
        res.redirect('/admin/add-vendor')
      }
    });
    }
  })
});

router.get("/edit-vendor/:id", verifyLogin, async (req, res) => {
  let vendorDetails = await adminHelpers.getVendorDetails(req.params.id);
  console.log(vendorDetails);
 
  res.render("admin/edit-vendor", { admin: true, vendorDetails });
});

router.post("/edit-vendor/:id",verifyLogin, (req, res) => {
  adminHelpers.updateVendor(req.params.id, req.body).then(() => {
    res.redirect("/admin/view-vendors");
  })
});

router.get("/delete-vendor/:id", verifyLogin, (req, res) => {
  let vendorId = req.params.id;
  console.log(vendorId);
  adminHelpers.deleteVendor(vendorId).then((response) => {
    res.redirect("/admin/view-vendors");
  })
});

router.get("/category", verifyLogin,(req,res)=>{
  adminHelpers.getAllCategorys().then((categorys) => {
    console.log(categorys)
    res.render("admin/category", { categorys,admin:true});
  })
  
});

router.post("/add-category",verifyLogin, (req, res) => {
  adminHelpers.addCategory(req.body).then((response) => {
    console.log(response.status);
    res.redirect("/admin/category");
  })
});


router.get("/edit-category/:id", verifyLogin, async (req, res) => {
  
  let categoryDetails = await adminHelpers.editCategory(req.params.id);
  console.log(categoryDetails);
  res.render("admin/edit-category", { categoryDetails,admin:true});
});

router.post("/edit-category/:id", verifyLogin, (req, res) => {
  adminHelpers.updateCategory(req.params.id, req.body).then((response) => {
    console.log(response.status);
    res.redirect("/admin/category");
  })
});

router.get("/delete-category/:id", verifyLogin, (req, res) => {
  let categoryId = req.params.id;
  console.log(categoryId);
  adminHelpers.deletecategory(categoryId).then((response) => {
    res.redirect("/admin/category");
  })
});

router.get("/sales",verifyLogin,async (req,res)=>{
  let sales = await adminHelpers.getSalesReport();
  res.render("admin/sales", {admin:true, sales,  });
});

router.get("/salesdata",verifyLogin,async(req,res)=>{
  let bestSelling= await adminHelpers.getBestSellingProducts();
   response.BSPlabel = bestSelling.map( item => item.product)
   response.BSPdata = bestSelling.map( item => item.total)
   let daysales=await adminHelpers.getDaySales();
   response.DSlabel= daysales.map( item => item._id)
   response.DSdata = daysales.map( item => item.total)
   response.salesReport= await adminHelpers.getSalesReport();
  res.json(response)
});

router.get("/salesfilter/:filter",verifyLogin,async(req,res)=>{
  let filter =req.params.filter
   if(filter ==="Today"){
    response.salesReport= await adminHelpers.getThisDaySalesReport();
   }else if(filter ==="ThisMonth"){
    response.salesReport= await adminHelpers.getThisMonthSalesReport();
   }else if(filter ==="All"){
    response.salesReport= await adminHelpers.getSalesReport();
   }
  res.json(response)
});

router.get("/enquiries",verifyLogin,async(req,res)=>{
  let enquiries=await adminHelpers.getEnquiries();
  res.render("admin/enquiery",{admin:true,enquiries}) 
});

router.get("/test",async(req,res)=>{
  let date =moment().format('DD-MM-YYYY')
  let thisMonhtSales = await adminHelpers.getThisDaySalesReport()
})

module.exports = router;
