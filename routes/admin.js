var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
var adminHelpers=require('../helpers/admin-helpers');


const  verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('admin/login')
    next()
  }
}


/* GET users listing. */
router.get('/',verifyLogin, function(req, res, next) {
     let tiltes = [{title : "ADMIN DASHBOARD"}];
     let css = [{css:'stylesheets/admindash.css'}];
     let scripts = [{script:'javascripts/admindash.js'},{script:'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'}];
    res.render('admin/dashboard',{admin:true,scripts,css,tiltes})
  
 
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
router.get('/login',(req, res)=> {
 
  if (req.session.loggedIn){
    res.redirect('/')
  }else{
 
  res.render('admin/admin-login',{"loginErr":req.session.loginErr}) 
  req.session.loginErr=false 
  
  }

});

router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if (response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/admin')
      console.log("logedin");
    }else{
      req.session.loginErr=true
      res.redirect('/admin/login')
      
    }
  })
  
});


router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin/login')  
  
});


router.get('/add-product', verifyLogin, function(req, res) {
  res.render('admin/add-product',{admin:true})
 
});


router.post('/add-product', (req,res,)=> {

  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")

      }else{
        console.log(err);
      }
    })
  })
 
 
});




module.exports = router;
