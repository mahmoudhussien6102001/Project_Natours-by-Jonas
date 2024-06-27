const AppError = require('../utils/AppError');
const User = require('./../models/usermodel');
const catchAsync =  require('./../utils/catchAsync');
const factory = require('./../controllers/handleFactory');
const multer = require('multer');
const sharp =require('sharp');
/* 
const multerStorage = multer.diskStorage({
destination :(req,file,cb)=>{
    cb(null,'public/img/users')
},
filename:(req,file,cb)=>{
    // user-userid-date.jpeg
    const ext=file.mimetype.split('/')[1];
    cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
}
});
*/
const multerStorage =multer.memoryStorage();
const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError ('not an image ! please upload only images ' ,404),false )
    }
};

const upload =multer({
    storage:multerStorage,
    fileFilter:multerFilter

});
exports.uploadImage = upload.single('photo');
exports.resizeUserPhoto =(req,res,next)=>{
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
 sharp(req.file.buffer)
 .resize(500,500)
 .toFormat('jpeg')
 .jpeg({quality:90})
 .toFile(`public/img/users/${req.file.filename}`);
    next();
}

const filterObj = (obj ,...allowedFields)=>{
    const newObj={} ;
    Object.keys(obj).forEach(ele =>{
        if(allowedFields.includes(ele)) newObj[ele] = obj[ele];

    });


    return newObj;
};

/*
exports.allUsers= async (req,res)=>{
    const Users = await User.find();
    if (!Users) {
        return res.status(404).json({
            status: 'fail',
            message: 'no user found'
        });
    }
    res.json({
        status: 'success',
        results: Users.lenguth,
        data: {
            Users : Users
        }
    });
}*/


exports.createUsers=(req,res)=>{
res.status(500).json({
    status:'error',
    message :"this router is not defined ! please use /signUp instead" 
})
}
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Check if user is trying to update password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update', 400));
    }

    // 2) Filter out fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file) filteredBody.photo=req.file.filename;

    // 3) Update user document
    const id = req.body.id;
    const updateUser = await User.findByIdAndUpdate(id, filteredBody, {
        new: true,
        runValidators: true
    });

    // If no user is found or no changes were made, display a message
    if (!updateUser) {
        return res.status(404).json({
            status: 'fail',
            message: 'No user found or no changes were made to the user data'
        });
    }

    // Send success response with updated data
    res.status(200).json({
        status: 'success',
        data: {
            newData: updateUser
        }
    });
});

exports.deleteMe= catchAsync (async(req,res ,next)=>{
    await User.findByIdAndDelete(req.body.id ,{active :false })
    res.status(200).json({
        status: 'success',
        data :null
    });


});
exports.getMe=(req,res,next)=>{
    req.params.id= req.user.id;
    next()
}

exports.updateUsers= factory.updateOne(User);
exports.deleteUsers= factory.deleteOne(User);
exports.allUsers=factory.getAll(User)
exports.getUsers=factory.getOne(User) ;


