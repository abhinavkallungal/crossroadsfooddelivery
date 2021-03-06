var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
const { response, request } = require("express");


const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    userHelpers.getUserStatus(req.session.user._id).then((response)=>{
      if(response.UserStatus =="active"){
        next();
      }else{
        req.session.destroy(); 
        res.redirect("/login");
        next();
      }
    })
  } else {
    res.redirect("/login");
    next();
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount
  if (user) {
    userCart= await userHelpers.checkCartAvaiable(req.session.user._id)
    if(userCart){
       cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
  }
  productHelpers.getAllProducts().then((products) => {
    res.render("user/homepage", { userhead: true, user, products, cartCount });
  });
});

router.get("/signup", function (req, res) {
  let scripts = [{ script: "/javascripts/signup.js" }];
  res.render("user/user-signup", {
    scripts,
    emailErr: req.session.emailErr,
    userhead: true,
  });
  req.session.emailErr = false;
});

router.post("/signup", (req, res) => {
  req.body.MobileNo = "+91"+req.body.MobileNo
  console.log(req.body.MobileNo);
  userHelpers.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.emailErr = true;
      res.redirect("/signup");
    } else {
      console.log(response);
      req.session.userLoggedIn = true;
      req.session.user = response;
      res.redirect("/");
    }
  });
});

router.get("/login", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", {
      loginErr: req.session.loginErr,
      userhead: true,
    });
    req.session.loginErr = false;
  }
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log("1");
      if(response.user.Status==="active"){
        console.log("2");
        req.session.userLoggedIn = true;
       req.session.user = response.user;
       console.log(req.session.user.Status);
       res.redirect("/");
      }else{
        console.log("3");
        req.session.statusErr = true;
        req.session.destroy();
        res.redirect("/login");
      }
      
    } else {
      console.log("4");
      req.session.loginErr = true;
      res.redirect("/login");
    }
  });
});
router.get("/otplogin",(req,res)=>{
  res.render("user/otplogin",{userhead:true})
})

router.post("/otpLogin", (req, res) => {
  MobileNumber =  req.body.MobileNumber;
  console.log("mobile", MobileNumber);
  userHelpers.doMobileValidation(MobileNumber).then((response) => {
    console.log("response",response);
    if (response.available) {
      console.log("mobile", MobileNumber)
      userHelpers.doSendOtp(MobileNumber).then((response)=>{
        console.log(response);
        res.status(200);
        res.json(response.Status)
      })
    } else {
      res.json(response)
    }
  });
});

router.post("/verifyotp", (req, res) => {
  MobileNumber = req.body.mobileno, 
  Otp = req.body.Otp;
  console.log(MobileNumber, Otp);
  userHelpers.doVerifyOtp(MobileNumber,Otp).then((response)=>{
    console.log("response",response);
    if(response.status){
      if(response.user.Status=="active"){
        req.session.userLoggedIn = true;
       req.session.user = response.user;
       console.log("ready",req.session.user);
       res.redirect("/");
      }else{
        req.session.statusErr = true;
        req.session.destroy();
        res.redirect("/login");
      }
    } 
    
  })
  
});

router.get("/logout", (req, res) => {
  req.session.userLoggedIn=false;
  req.session.user=null;
  res.redirect("/");
});

router.get("/profile",verifyLogin,(req,res)=>{
  let user= req.session.user
res.render("user/profile",{userhead: true,user})
});
router.post("/updateprofile/:id",verifyLogin,async(req,res)=>{
  userId=req.params.id;
  userData= req.body;
  await userHelpers.updateProfile(userId,userData).then((response)=>{
    res.redirect("/")
  })
});

router.get("/resetpassword",verifyLogin,(req,res)=>{
  userId=req.session.user._id
  user= req.session.user
  res.render("user/resetpassword",{userhead:true,userId,user})
 
})

router.post("/resetpassword/:id",verifyLogin,async(req,res)=>{
  userId=req.params.id
  oldPassword=req.body.oldPassword,
  newPassword=req.body.Password
 await userHelpers.checkPassword(userId,oldPassword).then((response)=>{
   if(response.status){
    console.log(response.status);
     userHelpers.resetPassword(userId,newPassword).then((response)=>{
      res.redirect("/profile")
    })
   }else{
    console.log(response.status);
    passwordErr=true;
    res.redirect("/resetpassword")
   }
 })
  res.redirect("/resetpassword")
})

router.get("/ourbakers", async function (req, res) {
  let user = req.session.user;
  let cartCount
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    console.log("cartCount",cartCount);
  }
  userHelpers.getAllVendors(response).then((vendors) => {
    res.render("user/ourbakers", { userhead: true, vendors, user, cartCount });
  });
});

router.get("/viewproducts/:id", verifyLogin, async function (req, res) {
  let user = req.session.user;
 
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  let vendorId = req.params.id;
   await productHelpers.getVendorProducts(vendorId).then((products) => {
    res.render("user/view-products", {
      userhead: true,
      products,
      user,
      cartCount,
    });
  });
});

router.get("/aboutus", async function (req, res) {
  let user = req.session.user;
  let cartCount = 0;
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    
  }
  res.render("user/aboutus", { userhead: true, user, cartCount });
});

router.get("/contactus", async function (req, res) {
  let user = req.session.user;
  let cartCount
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  res.render("user/contactus", { userhead: true, user, cartCount });
});
router.post("/contactus",async (req,res)=>{
  console.log(req.body);
  req.body.Date =new Date()
  userHelpers.addEnquiery(req.body).then((response)=>{
    res.redirect("/")
  })
})


router.post("/add-to-cart/:id/:vid", verifyLogin, (req, res) => {
  productId = req.params.id
  vendorId = req.params.vid
  userId = req.session.user._id;
  userHelpers.addToCart(productId,vendorId, userId).then(() => {
    res.json({ status: true });
  });
});
router.get("/emptycart",verifyLogin, async function (req, res) {
  let user = req.session.user;
  res.render("user/emptycart", { userhead: true, user  });
});


router.get("/cart", verifyLogin, async (req, res) => {
  user = req.session.user
  userId = req.session.user._id
  let userCart = await userHelpers.checkCartAvaiable(userId)
  console.log(userCart);
  if (userCart) {
    let total = await userHelpers.getTotelAmount(req.session.user._id);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let cartProducts = await userHelpers.getCartProducts(req.session.user._id);
    console.log("userjs184"+cartProducts);
    res.render("user/cart", {
      cartProducts,
      user,
      cartCount,
      total,
      userhead: true,
    });
  } else {
    res.redirect("/emptycart");
  }
});

router.post("/change-product-quantity", verifyLogin, (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotelAmount(req.body.user);
    res.json(response);
  });
});

router.post("/removeCartItem", verifyLogin, async (req, res) => {
  console.log(req.body);
  await userHelpers.removeCartItem(req.body).then(async (response) => {
    response.total = await userHelpers.getTotelAmount(req.body.user);
    res.json(response);
  });
});

router.get("/checkout", verifyLogin, async function (req, res) {
  let user = req.session.user;

  console.log(req.session.user);
  let total = await userHelpers.getTotelAmount(req.session.user._id);
  res.render("user/checkout", { userhead: true, total, user });
});

router.post("/checkout", verifyLogin, async (req, res) => {
  let vendorPrice=await userHelpers.getvendorPrice(req.body.userId)
  console.log("getTotelAmount");
  let totalPrice = await userHelpers.getTotelAmount(req.body.userId);
  console.log("placeOrder");
  userHelpers.placeOrder(req.body, totalPrice,vendorPrice).then((orderId) => {
    if (req.body["payment-method"] === "COD") {
      let response= {};
      response.codsuccess= true;
      response.orderId = orderId;
      res.json(response);
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
      });
    }
  });
  console.log(req.body);
});

router.get("/order-success/:id",verifyLogin,async (req, res) => {
  let orderId = req.params.id
  console.log(orderId);
  let user = req.session.user;
  let order = await userHelpers.getOrderDetails(orderId);
  console.log(order);
  res.render("user/ordersuccess", { userhead: true, user, order })
});

router.get("/orders", verifyLogin, async (req, res) => {
  let user = req.session.user;
  
  if (user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  let orders = await userHelpers.getUserOrders(req.session.user._id);
  res.render("user/orders", { userhead: true, user, orders, cartCount });
});

router.post("/verify-Payment",(req,res)=>{
  console.log(req.body);
  orderId=req.body['order[receipt]']
  userHelpers.verifyRazorpay(req.body).then(()=>{
    userHelpers.changePayementStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment success');
      res.json({status:true,orderId:orderId})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:'payment failed'})
  })
})

router.get("/view-order-products/:id/:vendorId", async (req, res) => {
  let products = await userHelpers.getOrderProduct(req.params.id,req.params.vendorId);
  console.log(products);
  res.render("user/view-orderproduct", { user: req.session.user, products });
});
router.get("/test",async(req,res)=>{
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  console.log(cartCount);
})



module.exports = router;
