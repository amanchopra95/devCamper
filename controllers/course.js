const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Courses');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get All Courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  PUBLIC 
exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.query.bootcampId) {
        const courses = Course.find({ bootcamp: req.query.bootcampId });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advanceResults)
    }

})

// @desc    Get single Course
// @route   GET /api/v1/courses/:id
// @access  PUBLIC 
exports.getSingleCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({ 
        path: 'bootcamp',
        select: 'name description'
     });
    if (!course) {
        next(new ErrorResponse(`Course not found with Id ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: course });
});

// @desc    Add  Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  PRIVATE 
exports.addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        next(new ErrorResponse(`Bootcamp not found with Id ${req.params.bootcampId}`, 404));
    }

    // Make sure the user is owner of this bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to add a course to this bootcamp`, 401));
    }

    const course = await Course.create(req.body);

    if (!course) {
        next(new ErrorResponse(`Course not found with Id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: course });
});

// @desc    Update  Course
// @route   PUT /api/v1/courses/:id
// @access  PRIVATE 
exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if (!course) {
        next(new ErrorResponse(`Course not found with Id ${req.params.id}`, 404));
    }

    // Make sure the user is owner of this bootcamp
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to update a course to this bootcamp`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: course });
});

// @desc    Delete Course
// @route   DELETE /api/v1/courses/:id
// @access  PRIVATE 
exports.deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course) {
        next(new ErrorResponse(`Course not found with Id ${req.params.id}`, 404));
    }

    // Make sure the user is owner of this bootcamp
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to delete the course to this bootcamp`, 401));
    }

    await course.remove();

    res.status(200).json({ success: true, data: {} });
});