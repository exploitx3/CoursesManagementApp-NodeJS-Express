var passport = require('passport');
var mongodb = require('mongodb').MongoClient;
var LocalStrategy = require('passport-local').Strategy;
var passwordHashFunc = require('password-hash-and-salt');

var localStrategyConf = function (mongoUrl) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('users').findOne({username: username}, function (err, result) {
                db.close();
                if (!result) {
                    done(null, false, {message: "Incorrect username"});
                } else {
                    passwordHashFunc(password).verifyAgainst(result.password, function (error, verified) {
                        if (error) {
                            done(null, false, {message: "Hashing Error."})
                        }
                        if (!verified) {
                            done(null, false, {message: "Incorrect password"})
                        } else {
                            done(null, result);
                        }
                    });
                }

            });
        })
    }))
};

module.exports = localStrategyConf;