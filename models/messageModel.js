var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const MessageSchema = new Schema({
    body: String,
    creator: String,

    comments: Array,
    peopleLiked: Array
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = {
    Message: Message
    }