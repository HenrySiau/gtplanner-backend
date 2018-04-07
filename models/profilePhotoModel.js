var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ProfilePhotoSchema = new Schema({
    url: {
        type: String,
        maxlength: 30
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
});


const ProfilePhoto = mongoose.model('User', ProfilePhotoSchema);
module.exports = {
    ProfilePhoto: ProfilePhoto
}