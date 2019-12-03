const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Courses');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  PUBLIC 
exports.getReviews = asyncHandler(async (req, res, next) => {

    if (req.query.bootcampId) {
        const reviews = Review.find({ bootcamp: req.query.bootcampId });
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advanceResults)
    }
})

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  PUBLIC 
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(new ErrorResponse(`No review found`, 404));
    }

    res.status(200).json({
        success: true,
        data: review
    });

})

// @desc    Create review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  PRIVATE 
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`, 404));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    })
})

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  PRIVATE 
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`, 404));
    }

    // Review belongds to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorised to update the review`, 401))
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    })
})

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  PRIVATE 
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`, 404));
    }

    // Review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorised to update the review`, 401))
    }

    review.remove();

    res.status(200).json({
        success: true,
        data: {}
    })
})