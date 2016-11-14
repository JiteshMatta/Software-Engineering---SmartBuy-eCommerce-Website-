var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path = require('path'), fs = require('fs');
var http = require('http');
var server = http.createServer(app);
var Grid  = require('gridfs-stream');
var multer   = require('multer');
var bodyParser   = require('body-parser');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url); 

require('./config/passport')(passport); 

app.configure(function() {

   app.use(express.cookieParser());
   //app.use(express.bodyParser()); 
   app.use(bodyParser.urlencoded({ extended: false }))
   app.use(bodyParser.json());
   app.use(multer({ dest: './uploads/'}));
   app.use(express.static(path.join(__dirname, 'public')));
   //app.use('/app', express.static(path.join(__dirname, 'app')));
   app.use('/models', express.static(path.join(__dirname, 'models')));
   app.set('models', __dirname + '/models');
   app.use('/controllers', express.static(path.join(__dirname, 'controllers')));
   app.set('controllers', __dirname + '/controllers');
   app.use('/views', express.static(path.join(__dirname, 'views')));
   app.set('views', __dirname + '/views');
   app.engine('html', require('ejs').renderFile);
   app.use(express.session({ secret: 'smartbuy' }));  
  /*app.use(express.bodyParser({uploadDir:'/images'}));*/
   app.use(passport.initialize());
   app.use(passport.session()); 
   app.use(flash()); 

});


require('./controllers/routes.js')(app, passport,server); 

require('./controllers/addInventory.js')(app, multer, mongoose, Grid);
require('./controllers/editInventory.js')(app, multer, mongoose, Grid);
require('./controllers/sellerproducts.js')(app, mongoose, Grid);
require('./controllers/login.js')(app,passport);
require('./controllers/signup.js')(app, passport,server); 
require('./controllers/forgot.js')(app);
require('./controllers/reset.js')(app);

server.listen(port);
console.log('Listening  to  port ' + port);


