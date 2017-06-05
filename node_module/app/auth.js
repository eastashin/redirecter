var config = require('../config');
var User = require('./models/user').User;
var crypto = require('crypto');

module.exports.createUser = function(userData) {
    var user = {
        username: userData.username,
        password: hash(userData.password)
    };
    return new User(user).save()
};

module.exports.getUser = function(id) {
    return User.findOne(id)
};

module.exports.checkUser = function(userData) {
    return User
        .findOne({username : userData.username})
        .then(function(doc){
            console.log(userData);
            if ( doc.password == hash(userData.password) ){
                console.log("User password is ok");
                return Promise.resolve(doc)
            } else {
                return Promise.reject("Error wrong")
            }
        })
};

function hash(text) {
    return crypto.createHash('sha1')
        .update(text).digest('base64')
}

