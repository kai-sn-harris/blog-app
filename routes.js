const User = require("./models/User"),
Post = require("./models/Post"),
bcrypt = require("bcryptjs");

module.exports = (app) => {
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
    app.get("/blog/:username", async (req, res) => {
        let username = req.params.username;

        const viewBlog = () => {
            User.findOne({username: username}).populate("posts").exec((err, user) => {
                if(err) {
                    console.log(err);
                    res.redirect("/");
                } else res.render("blog", {user: user});
            });
        }

        // check if blog is private
        User.findOne({username: username}).populate("friends").exec((err, user) => {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                if(!user) res.render("/");
                else {
                    // if the user is not private view the blog or you are logged in
                    if(!user.private) viewBlog();
                    else {
                        // check if the user is not logged in, if they aren't, they cannot view a private blog
                        if(!(req.session && req.session.userId)) res.render("privateAccount", {name: username});
                        else {
                            // get blog owner's friends, check if logged in user is in that list
                            user.friends.forEach(friendID => {
                                if(friendID === req.session.userId) return viewBlog();
                            });
                            res.render("privateAccount", {name: username, friend: false});
                        }
                    }
                }
            }
        });
    });

    app.get("/profile", (req, res) => {
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            User.findById(req.session.userId, (err, user) => {
                res.render("profile", {
                    user: user,
                    error: req.flash("error"),
                    tab: req.flash("tab")
                });
            });
        }
    });

    app.post("/search", (req, res) => {
        let search = req.body.search;
        // find the username inside db
        User.findOne({username: search}, (err, user) => {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                if(!user) res.render("users", {search: search});
                else res.render("users", {search: search, user: user});
            }
        });
    });

    // POST REQUESTS
    app.post("/register", (req, res) => {
        let hash = bcrypt.hashSync(req.body.user.password, 14);
        req.body.user.password = hash;
        let user = new User(req.body.user);
        user.posts = [];
        user.email = user.email.toLowerCase();
        user.bio = "";
        user.imgSrc = "";
        user.private = false;
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
            await post.save(err => {
                if(err) console.log(err);
            });
            // find user and add it's new post
            User.findById(req.session.userId, async (err, user) => {
                if(err) {
                    console.log(err);
                    // if an error occured, delete the post as it will not be linked to the user
                    await Post.findByIdAndDelete(post._id);
                } else {
                    user.posts.push(post);
                    await user.save();
                    res.redirect("/blog");
                }
            });
        }
    });

    app.post("/updateprofile", async (req, res) => {
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            let user = req.body.user;
            user.private === "on" ? user.private = true : user.private = false;
            await User.findOneAndUpdate({email: user.email}, user, async (err) => {
                if(err) {
                    if(err.code === 11000) {
                        req.flash("error", "Username already in use");
                        req.flash("tab", "edit");
                        res.redirect("/profile");
                    }
                } else res.redirect("/profile");
            });
        }
    });

    // DELETE requests
    app.delete("/deletepost/:id", (req, res) => {
        // find post
        // dont need to populate comments as we only care about the post
        Post.findByIdAndDelete(req.params.id, (err, post) => {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else res.redirect("/blog");
        });
    });
}