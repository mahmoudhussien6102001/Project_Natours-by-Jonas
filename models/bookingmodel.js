const mongoose = require ('mongoose');

const bookingSchema = new mongoose.Schema({
    tour :{
        type : mongoose.Schema.ObjectId ,
        ref:'Tour' ,
        required  :[true , 'Booking must belongs to tour ']
    },
    user:{
        type :mongoose.Schema.ObjectId ,
        ref :'User' ,
        required :[true , 'Booking must belongs to user ']
    },
    price :{
        type :Number ,
        required :[true , 'Booking must have price '] 
    },
    createddAt :{
        type : Date ,
        default : Date.now()
    },
    pid:{
        type: Boolean,
        default  : true 
    }
});
bookingSchema.pre(/^find / , function (next ){
    this.populate('user').populate({
        path: 'tour' ,
        select : 'name' 
    })
    next()
});

const Booking = mongoose.model ('Booking ' ,bookingSchema );
module.exports =Booking ;