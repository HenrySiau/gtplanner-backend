var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'User name required'],
        validate: {
            validator: function (v) {
                if (v.length < 2 || v.length > 20) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '{VALUE} is shorter than 2 or longer than 20 characters'
        },
    },

    email: {
        type: String,
        index: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
        },
        required: [true, 'Email required'],
        unique: true
    },
    
    phoneNumber: {
        type: String,
        maxlength: 30
    },

    password: {
        type: String,
        validate: {
            validator: function (v) {
                if (v.length < 8 || v.length > 30) {
                    return false;
                } 
                else {
                    return ((/[a-z]+[A-Z]+[0-9]/g).test(v))
                }
            },
            message: 'password format invalid'
        },
        required: true
    },
    profilePhoto: {
        type: Schema.Types.ObjectId,
        ref: 'ProfilePhoto'
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

// UserSchema.index({email: true});

const User = mongoose.model('User', UserSchema);
module.exports = {
    User: User
}