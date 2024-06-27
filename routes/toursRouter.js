const express = require('express');
const tourController = require('./../controllers/toursController');
const authController = require('./../controllers/authController');
const reviewRouter = require ('./../routes/reviewRouter');
//const reviewController = require ('./../controllers/reviewController');
const router = express.Router();


//router.route('/:tourId/reviews').post(authController.protect ,authController.restrictTo('user') ,reviewController.createReview)
// nested routers 
router.use('/:tourId/reviews' ,reviewRouter);

router.get('/top-5-cheap',tourController.aliasTopTours, tourController.allTours);
router.get('/tour-stats',tourController.getTourStat);
router.get('/monthly-plan/:year' ,authController.protect ,tourController.getMonthelyPlan);
router.get('/', authController.protect ,authController.restrictTo('admin'),tourController.allTours);
router.post('/', tourController.createTours);
router.get('/:id', tourController.getTours);
router.patch('/:id', tourController.updateTours);
router.delete('/:id', authController.protect ,authController.restrictTo('admin'),tourController.deleteTours);

module.exports = router;
