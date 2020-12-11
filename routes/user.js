var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var userHelpers=require('../helpers/user-helpers');
var adminHelpers=require('../helpers/admin-helpers');
const { response } = require('express');

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
    next();
  }
};


/* GET home page. */
router.get('/', async function(req, res, next) {
  let user=req.session.user;
  let cartCount = null
  if (user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
  res.render('user/homepage', {userhead:true,user, products ,cartCount});
  })
});

router.get("/signup",  function (req, res) {
  
  let scripts = [{ script: "/javascripts/signup.js" }];
  res.render("user/user-signup",{scripts,"emailErr":req.session.emailErr,userhead:true});
  req.session.emailErr=false
});

router.post('/signup',(req, res)=> {
  userHelpers.doSignup(req.body).then((response)=>{
    if(response.status){
      req.session.emailErr=true
      res.redirect('/signup')
      
    }else{
      console.log(response);
     req.session.loggedIn=true
     req.session.user=response
     res.redirect('/')
    }
    
  })
  
});



router.get('/login',(req, res)=> {
  if (req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr":req.session.loginErr,userhead:true}) 
  req.session.loginErr=false 
  
  }

});

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr=true
      res.redirect('/login')
      
    }
  })
  
});

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')  
  
});

router.get("/ourbakers", async function (req, res) {
  let user=req.session.user;
  let cartCount = null
  if (user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getAllVendors(response).then((vendors)=>{
    res.render('user/ourbakers', {userhead:true, vendors,user ,cartCount});
    })
});


router.get("/viewproducts/:id",async function (req, res) {
  let user=req.session.user;
  let cartCount = null
  if (user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  
  let vendorId = req.params.id;
  productHelpers.getvendorProducts(vendorId).then((products)=>{
    res.render("user/view-products",{userhead:true,products,user,cartCount});
  })
});


router.get("/aboutus", async function (req, res) {
  let user=req.session.user;
  let cartCount = null
  if (user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
 
  res.render("user/aboutus",{userhead:true,user,cartCount});
});

router.get("/contactus", async function (req, res) {
  let user=req.session.user;
  let cartCount = null
  if (user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  res.render("user/contactus",{userhead:true,user,cartCount});
});

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  userId = req.session.user._id
  userHelpers.addToCart(req.params.id,userId).then(() => {

      res.json({ status: true });
    })
});

router.get('/cart',verifyLogin,async(req,res)=>{
  
  try{
    user=req.session.user;
    let total= await userHelpers.getTotelAmount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let cartProducts= await userHelpers.getCartProducts(req.session.user._id)
    console.log(cartProducts);
    res.render('user/cart',{cartProducts,user,cartCount,total,userhead:true})
  }
  catch{
    res.redirect('/aboutus')
  }
 
});


router.post('/change-product-quantity',verifyLogin,(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
      response.total= await userHelpers.getTotelAmount(req.body.user)
    res.json(response)
  })
})


router.get("/checkout",verifyLogin, async function (req, res) {
  let user=req.session.user;
  
  console.log(req.session.user);
  let total= await userHelpers.getTotelAmount(req.session.user._id)
  res.render("user/checkout",{userhead:true,total,user,});
});



router.post('/checkout',verifyLogin,async(req,res)=>{
    let products =await userHelpers.getCartProductList(req.body.userId)
    console.log("products"+products);
    let totalPrice= await userHelpers.getTotelAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      
      if(req.body['payment-method']=="COD"){
        res.redirect("'/order-success")
      }else{
        userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
        })
      }
      
  })
 console.log(req.body);

})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})




router.get('/orders',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProduct(req.params.id)
  console.log(products)
  res.render('user/view-orderproduct',{user:req.session.user,products})
})






module.exports = router;
