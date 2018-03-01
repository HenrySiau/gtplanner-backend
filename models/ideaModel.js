var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const IdeaSchema = new Schema({
    title: String,
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String,
    comments: Array,
    peopleLiked: Array,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date
});

const Idea = mongoose.model('Idea', IdeaSchema);

module.exports = {
    Idea: Idea
    }