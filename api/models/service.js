const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    categoryName: {
        type: String,
        require: true
    },
    name: {
        type: String,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    detail: {
        description: String,
        location: String,
        contact: String,
        establishedDate: Date,
        email: String,
        operationalTime: String,
        websiteLink: String

    },
    rating: {
        type: Number,
        default: -1
    },
    vendorImagePath : {
        type: String,
        required:true
    },
    register_date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Service = mongoose.model('service', ServiceSchema);