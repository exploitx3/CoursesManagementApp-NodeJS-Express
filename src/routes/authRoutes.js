var express = require('express');
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var authRouter = express.Router();
var passwordHashFunc = require('password-hash-and-salt');
var User = require('../models/userModel');
var router = function (mongoUrl) {

    var authController = require('../controllers/authController')(mongoUrl);


    authRouter.route('/login')
        .post(passport.authenticate('local', {
            failureRedirect: '/failure'
        }), authController.postLogin);


    authRouter.route('/register')
        .post(authController.postRegister);

    authRouter.route('/logout')
        .get(authController.getLogout);

    return authRouter;
};


module.exports = router;