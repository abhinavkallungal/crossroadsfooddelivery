var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');


/* GET home page. */
router.get('/', function(req, res, next) {
    let tiltes = [{title : "vendor "}];
    let css = [{css:'stylesheets/admindash.css'}];
    let scripts = [{script:'javascripts/admindash.js'},{script:'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'}];
   res.render('vendor/dashboard',{vendor:true,scripts,css,tiltes})
});

module.exports = router;
