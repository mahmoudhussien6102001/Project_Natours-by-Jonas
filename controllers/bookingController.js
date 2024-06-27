const Tour = require('./../models/toursmodel');
const catchAsync =require('./../utils/catchAsync');
const Factory= require('./../controllers/handleFactory');
const stripe = require('stripe') //(secert key );
const Booking =require('./../models/Booking');


exports.getCheckoutSession=catchAsync (async (req,res ,next)=>{
    // 1) Get the currently  booked tour
    const tour = await Tour.findById(req.params.tourId);
    


    // 2) create checkout session 
    // install stripe 
   const session = stripe.checkout.sessions.create({
        payment_method_types:['card'],
        success_url :`${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id:req.params.tourId ,
        line_items:[{
            name:`${tour.name} Tour`,
            description : `${tour.summary}`,
            images:[`/public/img/tours/${tour.imageCover}`],
            amount:tour.price*10,
            currency:'usd',
            quantity :1
        }]

    })

    // 3) Create session as response 
    res.status(200).json({
        status:'success',
        session
    })

});
exports.createBookingCheckout=catchAsync(async (req,res,next)=>{
    const {tour ,user ,price}=req.query;
    if(!tour && !user && !price) return next();
    await Booking.create({tour,user,price});
    res.redirect(req.originalUrl.split('?')[0]);
});





exports.createBooking =Factory.createOne(Booking);
exports.getBooking =Factory.getOne(Booking);
exports.getAllBooking =Factory.getAll(Booking);
exports.updateBooking =Factory.updateOne(Booking);
exports.deleteBooking =Factory.deleteOne(Booking);
