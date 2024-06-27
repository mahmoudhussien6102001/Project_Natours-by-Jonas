// function 
const appError = require('./../utils/AppError');
// error handler in Db 
const  handleCastErrorDB =err=>{
const message =`invalid ${err.path} : ${err.value} .` ;
return new appError(message ,400);
}
// error Duplicate in DB 
const handleDuplicateErrorDB = err=>{
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate fields value ${value }. please use another value !   `
    return new appError(message ,400);

}
// ERROR Mongoose schema invaild input data 
const handleVaildationErrorDB = err=>{
    const errors =  Object.values(err.errors).map(ele=>ele.message) ;
    const message = ` invaild input data. ${errors.join(' .')}` ;
    return new appError(message ,400);

}
const sendErrorDev = (err , res )=>{
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack:err.stack ,
        error : err
    });
}
const sendErrorPro = (err ,res ) =>{
    if (err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });

    }else {
        console.error('ERROR ') ;
        res.status(500).json({
            status: 'error',
            message: 'somethig error wrong !'
        });
    }
    
        
    
}
module.exports = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    if (process.env.Node_ENV === 'development') {
        sendErrorDev(err, res);
}else if (process.env.Node_ENV === 'production') {
    let error = {...err};
    if(error.name ==='CastError') error =handleCastErrorDB(error);
    if(error.name ==='VaildationError') error =handleVaildationErrorDB(error);
    if(error.code === 11000) error = handleDuplicateErrorDB(error)
    sendErrorPro(err ,res);
}
};