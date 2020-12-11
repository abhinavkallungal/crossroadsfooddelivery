var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helpers");
const { response } = require("express");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect("/admin/login")
    next()
  }
};

/* GET users listing. */
router.get("/", verifyLogin, function (req, res, next) {

  let css = [{ css: "stylesheets/admindash.css" }];
  let scripts = [
    { script: "javascripts/admindash.js" },
    { script: "https://cdn.jsdelivr.net/npm/chart.js@2.8.0" },
  ]
  res.render("admin/dashboard", { admin: true, scripts, css })
});

// router.get('/signup',(req, res)=> {
//   res.render('admin/signup')

// });
// router.post('/signup',(req, res)=> {
//   adminHelpers.doSignup(req.body).then((response)=>{
//      req.session.loggedIn=true
//      req.session.user=response
//      res.redirect('/')
//    })

// });
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/admin");
      console.log("logedin");
    } else {
      req.session.loginErr = true;
      res.redirect("/admin/login");
    }
  })
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

router.get("/add-product", function (req, res) {
  res.render("admin/add-product");
});

router.get("/crop", function (req, res) {
  res.sendFile('/crop.html', {root: __dirname })
  
});
router.post("/post", (req, res) => {
  
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

router.get("/view-vendors", verifyLogin, (req, res) => {
  let css = [{ css: "/stylesheets/vendor-management.css" }];
  let scripts = [{ script: "/javascripts/vendor-management.js" }];
  adminHelpers.getAllVendors().then((vendors) => {
    res.render("admin/view-vendors", {admin:true, vendors, css, scripts });
  })
});

router.get("/add-vendor", verifyLogin, (req, res) => {
  adminHelpers.addVendor(req.body).then((response) => {
    console.log(response);
  })
  let css = [{ css: "/stylesheets/vendor-management.css" }];
  let scripts = [{ script: "/javascripts/vendor-management.js" }];
  res.render("admin/add-vendor", { admin: true, scripts, css ,"nameErr":req.session.nameErr });
  req.session.nameErr = false
});

router.post("/add-vendor",verifyLogin, (req, res) => {
  adminHelpers.addVendor(req.body).then((response) => {
    if(response.status){
      console.log("test1");
      req.session.nameErr=true
      res.redirect('/admin/add-vendor')
      
    }else{
      console.log("test2");
      res.redirect("/admin/view-vendors");
    }
    
  })
});

router.get("/edit-vendor/:id", verifyLogin, async (req, res) => {
  let vendorDetails = await adminHelpers.editVendor(req.params.id);
  console.log(vendorDetails);
  let css = [{ css: "/stylesheets/vendor-management.css" }];
  let scripts = [{ script: "/javascripts/vendor-management.js" }];
  res.render("admin/edit-vendor", { admin: true, scripts, css, vendorDetails });
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
  let css = [{ css: "/stylesheets/category-management.css" }];
  let scripts = [{ script: "/javascripts/vendor-management.js" }];
  adminHelpers.getAllCategorys().then((categorys) => {
    console.log(categorys)
    res.render("admin/category", { categorys, css, scripts ,admin:true});
  })
  
});

router.post("/add-category",verifyLogin, (req, res) => {
  adminHelpers.addCategory(req.body).then((response) => {
    console.log(response.status);
    res.redirect("/admin/category");
  })
});


router.get("/edit-category/:id", verifyLogin, async (req, res) => {
  let css = [{ css: "/stylesheets/vendor-management.css" }];
  let scripts = [{ script: "/javascripts/vendor-management.js" }];
  let categoryDetails = await adminHelpers.editCategory(req.params.id);
  console.log(categoryDetails);
  res.render("admin/edit-category", { categoryDetails, css, scripts ,admin:true});
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

module.exports = router;
