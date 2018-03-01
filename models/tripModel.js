var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TripSchema = new Schema({
    name: String,
    description: String,
    profilePhoto: String,
    menbers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    administrators: Array,
    photos: Array,
    created: {
        type: Date,
        default: Date.now
    },
    isActive: Boolean,
    invitationCode: String
});

const Trip = mongoose.model('Trip', TripSchema);

module.exports = {
    Trip: Trip
    }