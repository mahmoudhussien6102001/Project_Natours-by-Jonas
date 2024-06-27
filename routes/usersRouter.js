const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword); 
//protect all routes after this middleware
router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword); 
router.patch('/updateMe'
,userController.uploadImage 
,userController.resizeUserPhoto
,userController.updateMe); 
router.get('/Me'  ,userController.getMe ,userController.getUsers);
router.delete('/deleteMe'  ,userController.deleteMe);

router.use(authController.restrictTo('admin'));
router.route('/')
    .get(userController.allUsers)
    .post(userController.createUsers);

router.route('/:id')
    .get(userController.getUsers)
    .patch(userController.updateUsers)
    .delete(userController.deleteUsers);

module.exports = router;
