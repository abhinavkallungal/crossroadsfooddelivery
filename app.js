var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config()
//=> set admin and user
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const vendorRouter = require('./routes/vendor');



//=> set hbs
var hbs=require('express-handlebars')


var app = express();


//=> set file uplode  for image uplode in add product page
var fileUpload=require('express-fileupload');


//=> db connect
var db=require('./config/connection');


var session=require('express-session');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


//=>set engine
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));


//=>use file  uploade
app.use(fileUpload());


app.use(session({
  secret: "key",
  resave: true,
  saveUninitialized: true,
  cookie:{maxAge:600000}

}));


//=> connect db
db.connect((err)=>{
  if(err)
  console.log('db connection err ');
  else
  console.log('db connected ');
})


app.use('/',  userRouter);
app.use('/admin', adminRouter);
app.use('/vendor', vendorRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


module.exports = app;
