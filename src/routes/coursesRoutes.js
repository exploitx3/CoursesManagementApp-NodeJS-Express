var express = require('express');
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var coursesRouter = express.Router();
var Course = require('../models/courseModel');

var router = function (mongoUrl) {
    var coursesController = require('../controllers/coursesController')(mongoUrl);

    coursesRouter.use(coursesController.middleware);

    coursesRouter.route('/add-course')
        .get(coursesController.getAddCourse)
        .post(coursesController.postAddCourse);

    coursesRouter.route('/top10')
        .get(coursesController.getTop10Courses);


    coursesRouter.route('/:id/rate/:rate')
        .get(coursesController.getRateCourseById);

    coursesRouter.route('/:id')
        .get(coursesController.getCourseById);

    return coursesRouter;
};

module.exports = router;