var mongoose = require('mongoose');

var urlSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        required: true,
        unique: true
    },
    urls: String,
    description: String,
    modified: { type: Date, default: Date.now }
});

var Url = mongoose.model('Url', urlSchema);

module.exports.Url = Url;