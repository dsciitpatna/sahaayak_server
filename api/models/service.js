const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    business : {
        certification : String,
        checkAll: Boolean,
        checkedList: Array,
        displayOperationalHours: Boolean,
        yearOfEstablishment: String,
        categoryName: String
    },
    contact: {
        designation: String,
        email : String,
        fax: String,
        landline: String,
        mobile: String,
        name: String,
        tollFree: String,
        website: String
    },
    location: {
        area: String,
        building: String,
        businessName: String,
        city: String,
        country: String,
        pinCode: String,
        state: String,
        street: String,
        landmark: String
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    rating: {
        type: Number,
        default: -1
    },
    register_date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Service = mongoose.model('service', ServiceSchema);