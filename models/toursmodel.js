const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have at most 40 characters'],
        minlength: [10, 'A tour name must have at least 10 characters'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have max group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['difficult', 'easy', 'medium'],
            message: 'Difficulty must be one of [difficult, easy, medium]'
        }
    },
    price: {
        type: Number,
        required: [true, 'Tour must have price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour must have a summary']
    },
    ratingsAverage: {
        type: Number,
        default: 4.9,
        min: [1.0, 'Ratings average must be above 1.0'],
        max: [5.0, 'Ratings average must be below 5.0'] ,
        //add function to prevent Duplicate Reviews 
        set : val=>Math.round(val*10) /10  
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Tour must have an image cover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now,
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            }
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// create indexes 

tourSchema.index({ slug: 1 } );
tourSchema.index({ price: 1 ,ratingsAverage :-1 });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
// virtual 
tourSchema.virtual('reviews' ,{
    ref:'Review' ,
    localField: '_id',
    foreignField: 'tour'
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took: ${Date.now() - this.start} milliseconds`);
    next();
});

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});
// populate guides 
tourSchema.pre(/^find/ ,function (next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt'
    });
    next();
})
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
