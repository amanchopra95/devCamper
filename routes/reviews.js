const router = require('express').Router({ mergeParams: true });
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/review');
const Review = require('../models/Review');
const { protect, authorize } = require('../middlewares/auth');
const advanceResults = require('../middlewares/advanceResults');

router.route('/')
    .get(advanceResults(Review, {
        path: 'bootcamp',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('user', 'admin'), addReview)

router.route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview)

module.exports = router;