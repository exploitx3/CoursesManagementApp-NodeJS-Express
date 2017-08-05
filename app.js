var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

var port = 80;

var mongoUrl = 'mongodb://localhost:27017/coursesApp';
var indexRoutes = require('./src/routes/index')(mongoUrl);
var authRoutes = require('./src/routes/authRoutes')(mongoUrl);
var coursesRoutes = require('./src/routes/coursesRoutes')(mongoUrl);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'CourseApp'}));
require('./src/config/passport')(app, mongoUrl);

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/courses', coursesRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
      res.redirect('/');
      //res.render('error', {
      //message: err.message,
      //error: err
    //});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
    res.redirect('/');
  //res.render('error', {
  //  message: err.message,
  //  error: {}
  //});
});

app.listen(port, function (err) {
    console.log('running server on port ' + port);
});
module.exports = app;
