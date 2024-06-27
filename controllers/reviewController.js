const Review = require('./../models/reviewmodel');
//const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/AppError');
const factory = require('./../controllers/handleFactory');
/*
exports.allReviews =catchAsync (async (req,res ,next)=>{
    let filter = {}
    if(req.params.tourId) filter ={tour : req.params.tourId};
   
    const Reviews = await Review.find(filter);
    if(!Reviews){
        return next(new AppError('not found Review in db' , 404))
    }
    res.status(200).json({
        status:'success',
        results : Reviews.lenght,
        data :{
            reviews :Reviews

        }
    })

} );
*/

/*
exports.getReview = catchAsync (async (req,res ,next)=>{
    const id =req.params.id ;
    const Reviews = await Review.findById(id);
    if(!Reviews){
        return next(new AppError('not found Review in db' , 404))
    }
    res.status(200).json({
        status:'success',
        data :{
            reviews :Reviews
        }
    })

} );
*/
exports.setTourUserId=(req ,res ,next )=>{
    if (! req.body.tour) req.body.tour = req.params.tourId ;
    if (! req.body.user) req.user.user = req.user.id ;
    next();

}
/*
exports.createReview =catchAsync (async (req,res ,next)=>{
    if (! req.body.tour) req.body.tour = req.params.tourId ;
    if (! req.body.user) req.user.user = req.user.id ;

    const newReviews = await Review.create(req.body);
    if(!newReviews){
        return next(new AppError('not found Review in db' , 404))
    }
    res.status(200).json({
        status:'success',
        data :{
            reviews :newReviews

        }
    })

} );
*/
exports.deleteReview = factory.deleteOne(Review) ;
exports.updateReview = factory.updateOne(Review) ;
exports.createReview = factory.createOne(Review) ;
exports.getReview = factory.getOne(Review) ;
exports.allReviews = factory.getAll(Review) ;




