const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'service'
    },
    review: {
        type: String,
        trim: true,
        required: true
    },
    likes: [mongoose.Schema.Types.ObjectId],
    register_date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Review = mongoose.model('review', ReviewSchema);