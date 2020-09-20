const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    body: {type: String, required: true},
    date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model("comment", commentSchema);