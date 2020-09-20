const mongoose = require("mongoose"),
uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "post"}]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("user", userSchema);