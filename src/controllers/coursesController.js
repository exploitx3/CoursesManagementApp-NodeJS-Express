var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Course = require('../models/courseModel');

var coursesController = function (mongoUrl) {
    var middleware = function (req, res, next) {
        if (!req.user) {
            res.redirect('/');
        } else {
            next();
        }
    };

    var getAddCourse = function (req, res) {
        if (!req.user.isEmployee) {
            res.redirect('/');
        } else {
            res.render('add-course', {user: req.user});
        }
    };

    var postAddCourse = function (req, res) {
        console.log(req.body);


        mongodb.connect(mongoUrl, function (err, db) {
            var coursesCollection = db.collection('courses');
            //TODO: make course and user as models
            var course = new Course(req.body.title, req.body.lector, req.body.mainCharacters, req.body.major, req.body.year);

            coursesCollection.find({title: course.title}).toArray(function (err, records) {
                if (records.length !== 0) {
                    console.log("Cannot register the same course twice.");
                    res.redirect('/');
                } else {
                    coursesCollection.insertOne(course, function (err, results) {
                        if (!err) {
                            res.redirect('/');
                        } else {
                            res.redirect('/add-course');
                        }
                    });
                }
            });
        });
    };

    var getTop10Courses = function (req, res) {
        mongodb.connect(mongoUrl, function (err, db) {
            var coursesCollection = db.collection('courses');
            coursesCollection.find({}).toArray(function (err, records) {

                db.close();
                var courses = records.map(function (elem) {
                    elem.rate = !(elem.rate / elem.rateCount) ? 0 : Number((elem.rate / elem.rateCount).toFixed(2));
                    return elem;
                }).sort(function (a, b) {
                    return (b.rate) - (a.rate);
                }).slice(0, 10);
                if (req.user.isEmployee) {
                    res.render('top10-logged-employee', {courses: courses, user: req.user});
                } else {
                    res.render('top10-logged-client', {courses: courses, user: req.user});
                }

            })
        })
    };

    var getRateCourseById = function (req, res) {
        var id = new ObjectId(req.params.id);
        var rate = req.params.rate;
        console.log(id);
        mongodb.connect(mongoUrl, function (err, db) {
            db.collection('courses').updateOne({_id: id}, {$inc: {rate: Number(rate), rateCount: 1}});
            db.close();
        });
        res.redirect('/courses/' + id);
    };

    var getCourseById = function (req, res) {
        var id = new ObjectId(req.params.id);
        mongodb.connect(mongoUrl, function (err, db) {
            var coursesCollection = db.collection('courses');
            coursesCollection.count(function (err, count) {
                var coursesCount = count;
                coursesCollection.find({_id: id}).toArray(function (err, records) {
                    if (records.length === 0) {
                        console.log("Cannot find the course.");
                        db.close();
                        res.redirect('/');
                    } else {
                        db.close();
                        var course = records[0];
                        course.rate = !(records[0].rate / records[0].rateCount) ? 0 : Number((records[0].rate / records[0].rateCount).toFixed(2));
                        if (req.user.isEmployee) {
                            res.render('course-logged-employee', {course: course, user: req.user});
                        } else {
                            res.render('course-logged-client', {course: course, user: req.user});
                        }
                    }
                })
            });
        });
    };

    return {
        middleware: middleware,
        getAddCourse: getAddCourse,
        postAddCourse: postAddCourse,
        getTop10Courses: getTop10Courses,
        getRateCourseById: getRateCourseById,
        getCourseById: getCourseById
    }
};

module.exports = coursesController;