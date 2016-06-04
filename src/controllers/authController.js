var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var passwordHashFunc = require('password-hash-and-salt');
var User = require('../models/userModel');

var authController = function (mongoUrl) {
    var postLogin = function (req, res) {
        res.redirect('/');
    };

    var postRegister = function (req, res) {

        passwordHashFunc(req.body.password).hash(function (err, hash) {
            if (err) {
                throw new Error('Bad Hash');
            }
            passwordHashFunc(req.body.password).hash(function (err, hash) {
                if (err) {
                    throw new Error('Error with the hashing algorithm');
                }
                var user = new User(req.body.username, hash, req.body.isEmployee);

                mongodb.connect(mongoUrl, function (err, db) {
                    var usersCollection = db.collection('users');


                    usersCollection.find({username: user.username}).toArray(function (err, records) {
                        if (records.length !== 0) {
                            console.log("Cannot register the same user twice.");
                            res.redirect('/');
                        } else {
                            usersCollection.insertOne(user, function (err, results) {
                                if (!err) {
                                    req.login(results.ops[0], function () {
                                        res.redirect('/');
                                    });
                                } else {
                                    res.redirect('/');
                                }
                            });
                        }
                    });
                })
            });
        });

    };

    var getLogout = function (req, res) {
        req.logout();
        res.redirect('/');

    };

    return {
        postLogin: postLogin,
        postRegister: postRegister,
        getLogout: getLogout
    }
};

module.exports = authController;