var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TripPhotoSchema = new Schema({
    url: {
        type: String,
        maxlength: 30
    },
    trip: {
        type: Schema.Types.ObjectId,
        ref: 'Trip'
    },
    created: {
        type: Date,
        default: Date.now
    },
});


const TripPhoto = mongoose.model('User', TripPhotoSchema);
module.exports = {
    TripPhoto: TripPhoto
}