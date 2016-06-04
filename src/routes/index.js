var express = require('express');
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var mainRouter = express.Router();

var router = function (mongoUrl) {

    mainRouter.route('/')
        .get(function (req, res) {
            if (!req.user) {
                res.render('index', {title: 'Express'});
            } else {
                mongodb.connect(mongoUrl, function (err, db) {
                    var coursesCollection = db.collection('courses');
                    coursesCollection.find({}).toArray(function (err, records) {
                        if (req.user.isEmployee) {
                            res.render('index-logged-employee', {courses: records, user: req.user});
                        } else {
                            res.render('index-logged-client', {courses: records, user: req.user});
                        }
                        db.close();
                    })
                });
            }
        });





    return mainRouter;
};

module.exports = router;