var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TripSchema = new Schema({
    title: {
        type: String,
        required: [true, 'trip title required'],
        validate: {
            validator: function (v) {
                if (v.length < 2 || v.length > 31) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '{VALUE} is shorter than 2 or longer than 50 characters'
        },
    },
    description: {
        type: String,
        maxlength: 301
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    invitationCode: {
        type: String,
        maxlength: 30,
        unique: true,
        index: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    photos: [{
        type: Schema.Types.ObjectId,
        ref: 'TripPhoto'
    }],
    created: {
        type: Date,
        default: Date.now
    },
    startDate: Date,
    endDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
});

const Trip = mongoose.model('Trip', TripSchema);

module.exports = {
    Trip: Trip
    }