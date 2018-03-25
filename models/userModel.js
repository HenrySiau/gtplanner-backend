var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {
        type: String,
        maxlength: 100,
        required: true
    },
    email: {
        type: String,
        maxlength: 100,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        maxlength: 30
    },
    password: {
        type: String,
        maxlength: 300,
        required: true
    },
    profilePhoto: {
        type: String,
        maxlength: 300
    },
    created: {
        type: Date,
        default: Date.now
    },
    isSocialAuth: {
        type: Boolean,
        default: false
    }
});
//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});
// Authenticate input against database
// Do not declare statics using ES6 arrow functions (=>)
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({
        email: email
    })
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } else if (!user) {
                return callback('wrong password or username');
            }

            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback('wrong password or username');
                }
            });
        });
};

UserSchema.statics.doesEmailExist = function (email, callback) {
    User.findOne({
        email: email
    })
        .exec(function (err, user) {
            if (err) {
                return callback(err);
            } 
            if (user) {
                return callback(null, true);
            }
            return callback(null, false);
        });

};

const User = mongoose.model('User', UserSchema);
module.exports = {
    User: User
}