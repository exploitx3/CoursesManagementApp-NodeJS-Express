var passport = require('passport');

var passportConfig = function(app, mongoUrl){
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done){
        done(null, user);
    });


    passport.deserializeUser(function(user, done){
        done(null, user);
    });

    require('./strategies/local.strategy')(mongoUrl);
};

module.exports = passportConfig;