const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    body: String,
    date: {type: Date, default: Date.now(), required: true},
    editDate: Date,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "comment"}]
});

module.exports = mongoose.model("post", postSchema);