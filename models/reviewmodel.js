const mongoose = require('mongoose');
const Tour = require('./../models/toursmodel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a User!']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a Tour!']
    }
});

// Prevent Duplicate Reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Calculate ratingsAverage 
reviewSchema.statics.calcAverageRating = async function(tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        console.log('no found reviews ')
        // Handle case when no reviews found
    }
};

// Middleware for calculating average rating after saving
reviewSchema.post('save', async function() {
    await this.constructor.calcAverageRating(this.tour);
});

// Middleware for calculating average rating after findOneAnd...
reviewSchema.post(/^findOneAnd/, async function(doc) {
    if (doc) {
        await doc.constructor.calcAverageRating(doc.tour);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
