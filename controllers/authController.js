const User = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const AppError =require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail =require('./../utils/email');
const crypto =require('crypto');
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {

        expiresIn :JWT_EXPIRES_IN
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    // send jwt cookie
    cookieOptions= {
        expires: new Date(Date.now() + 90* 24 * 60 * 60 * 1000),
        httpOnly: true
        
    };
    if (process.env.NODE_ENV ==='production') cookieOptions.secure = true;
    res.cookie("jwt",token,cookieOptions);
    user.password=undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data:{
            user
        }
    });
};


exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    createSendToken(newUser ,200 ,res);
    
   /* change this li create function name createSendToken 
    
    const token = signToken(newUser._id);

    res.status(200).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
    */
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(400).json({ message: 'Incorrect email or password' });
    }
    //createSendToken(user , 200 ,res) ;
    
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    });
    
});
// protected 
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        // Verify token
        const decoded = await promisify(jwt.verify)(token, 'my_ultra_secure_and_awad_long_secret');

        console.log(decoded);

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return next(new AppError('The user belonging to this token does not exist.', 401));
        }

        // Check if user changed password after the token was issued
        if (currentUser.changePasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password! Please log in again.', 401));
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
};
     

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not authorized to access this resource'
            });
        }
        next();
    };
};
exports.forgetPassword = catchAsync(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found'
        });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forget Your password! Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset Token (Valid for 10 Minutes)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset token sent to email'
        });
    } catch (err) {
        // If sending email fails, clear reset token and expiration
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Error sending email:', err); // Log the error for debugging purposes

        res.status(500).json({
            status: 'fail',
            message: 'Failed to send email. Please try again later.'
        });
    }
});


exports.resetPassword = catchAsync(async (req, res) => {
 
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        console.log('Hashed Token:', hashedToken);

        // Find the user by hashed token and ensure the token is not expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        // If no user found, or the token is expired, return an error response
        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'Password reset token is invalid or has expired'
            });
        }

        // Update user's password and reset token fields
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        // Save the updated user data
        await user.save();

        // Generate a new token for the user
        createSendToken(user , 200 , res);
   
    
});

exports.updatePassword= catchAsync(async(req ,res , next ) =>{
    // get user from collection 
    const user = await User.findById(req.user.id).select("+password");
    // check if posted current password isCorrect
    if(!(await user.correctPassword(req.body.passwordConfirm ,user.password))){
        return next (new AppError('your current password is wrong ! '));
    }
    // if ,so update password 
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm ;
    await user.save();
    // log user in , send JWT
    createSendToken(user ,200 ,res);

})
