var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var userHelpers=require('../helpers/user-helpers');


/* GET home page. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
  res.render('user/homepage', { products });
  })
});

router.get("/signup",  function (req, res) {
  
  let scripts = [{ script: "/javascripts/signup.js" }];
  res.render("user/user-signup",{scripts,"emailErr":req.session.emailErr});
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
  res.render('user/login',{"loginErr":req.session.loginErr}) 
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



module.exports = router;
//cdn.jsdelivr.net/npm/jquery-validation@1.19.2/dist/jquery.validate.js