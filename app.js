const express = require("express"),
app = express(),
mongoose = require("mongoose"),
sessions = require("client-sessions"),
bcrypt = require("bcryptjs");

if(process.env.NODE_ENV !== "production") require("dotenv").config();
const PORT = process.env.PORT;

const User = require("./models/User");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: true}));
app.use(sessions({
    cookieName: "session",
    secret: process.env.SECRET,
    duration: 60*10*30 // 30 mins
}));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

// GET REQUESTS

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/blog", (req, res) => {
    if(!(req.session && req.session.userId)) res.redirect("/login");
    else {
        // find user
        User.findById(req.session.userId, (err, user) => {
            // not sure what the next() function does but it works so yea
            if(err) next(err);
            if(!user) res.redirect("/login");
            else res.render("blog", {user: user});
        });
    }
});

// POST REQUESTS
app.post("/register", (req, res) => {
    let hash = bcrypt.hashSync(req.body.user.password, 14);
    req.body.user.password = hash;
    let user = new User(req.body.user);
    user.save((err) => {
        if(err) {
            res.render("register", {error: err});
        } else res.redirect("login");
    });
});

app.post("/login", (req, res) => {
    User.findOne({email: req.body.user.email}, (err, user) => {
        // if an error occured, or if the user is not found (falsey), or iff the password does not match
        if(err || !user || !bcrypt.compare(req.body.user.password, user.password)) {
            res.render("login", {error: "Incorrect username or password"});
        } else {
            // i think this sends a cookie to the browser
            req.session.userId = user._id;
            res.redirect("/blog");
        }
    });
});

app.listen(PORT, console.log(`Serving port ${PORT} at http://localhost:${PORT}`));