const Tour = require('./../models/toursmodel');
const Booking = require('./../models/bookingmodel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    // 1) Get tour data from collection 
    const tours = await Tour.find();
    // 2) Build template 
    // 3) Render the template using tour data from 1)
    res.status(200).render('overview', {
        title: "All Tours",
        tours
    });
});

exports.getTour = catchAsync(async (req, res) => {
    // 1) Get tour data from collection including reviews and guides
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
    });
    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    });
});


exports.getMyTour=catchAsync(async(req,res,next)=>{
    // find all booking
    const bookings =await Booking.find({user :req.user.id});
    // find tours with returned ids
    const tourIds= bookings.map(ele=>ele.tour);
    const tours = await Tour.find({_id:{$in :tourIds}});
    res.status(200).render('overview',{
        title :'My Tours ',
        tours
    })
})