const express = require("express"),
app = express(),
mongoose = require("mongoose"),
sessions = require("client-sessions"),
bcrypt = require("bcryptjs");

if(process.env.NODE_ENV !== "production") require("dotenv").config();
const PORT = process.env.PORT;

const User = require("./models/User"),
Post = require("./models/Post"),
Comment = require("./models/Comment");

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

app.get("/newpost", (req, res) => {
    // make sure user is logged in
    if(!(req.session && req.session.userId)) res.redirect("login");
    else res.render("newPost");
});

app.get("/blog", (req, res) => {
    if(!(req.session && req.session.userId)) res.redirect("/login");
    else {
        // find user
        User.findById(req.session.userId).populate("posts").exec((err, user) => {
            // not sure what the next() function does but it works so yea
            if(err) next(err);
            if(!user) res.redirect("/login");
            
            else res.render("myblog", {user: user});
        });
    }
});

// view another user's blog
app.get("/blog/:username", (req, res) => {
    // we dont need to be in a session to view this
    User.findOne({username: req.params.username}).populate("posts").exec((err, user) => {
        if(err) {
            console.log(err);
            res.redirect("/");
        } else {
            res.render("blog", {user: user})
        }
    });
});

// POST REQUESTS
app.post("/register", (req, res) => {
    let hash = bcrypt.hashSync(req.body.user.password, 14);
    req.body.user.password = hash;
    let user = new User(req.body.user);
    user.posts = [];
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

app.post("/newpost", async (req, res) => {
    // check if there is a web session
    if(!(req.session && req.session.userId)) res.redirect("/blog", {error: "Could create a new post at this time"});
    else {
        let post = new Post(req.body.post);
        post.save(err => {
            if(err) console.log(err);
        });
        // find user and add it's new post
        await User.findById(req.session.userId, async (err, user) => {
            if(err) {
                console.log(err);
                // if an error occured, delete the post as it will not be linked to the user
                await Post.findByIdAndDelete(post._id);
            } else {
                user.posts.push(post);
                user.save();
            }
        });
        res.redirect("/blog");
    }
});

app.listen(PORT, console.log(`Serving port ${PORT} at http://localhost:${PORT}`));