const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController =require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
router.get('/',bookingController.createBookingCheckout,authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/my-tours',authController.protect, viewController.getMyTour)

module.exports = router;
