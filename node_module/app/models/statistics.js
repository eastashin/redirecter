var mongoose = require('mongoose');

var statisticSchema = new mongoose.Schema({
    url_id: {
        type: String,
        required: true
    },
    userName: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    userAgent: {
        type : String
    },
    url: {
        type: String  
    },
    location: {
        type: String
    },
    success: {
        type: Boolean,
        required: true
    }
});

var Statistics = mongoose.model('Statistics', statisticSchema);

module.exports.Statistics = Statistics;