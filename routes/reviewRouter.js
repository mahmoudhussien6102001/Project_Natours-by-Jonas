const express = require('express');
const router = express.Router({mergeParams :true});
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
///protect all routes after this middleware

router.use(authController.protect);
router.route('/')
.get(reviewController.allReviews)
.post(authController.restrictTo('user','admin'),reviewController.setTourUserId,reviewController.createReview);
router.route('/:id')
.get(reviewController.getReview)
.delete(authController.restrictTo('user' ,'admin'),reviewController.deleteReview)
.patch(authController.restrictTo('user' ,'admin'),reviewController.updateReview);


module.exports = router ;