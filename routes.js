const User = require("./models/User"),
Post = require("./models/Post"),
bcrypt = require("bcryptjs"),
mongoose = require("mongoose");

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
        User.findOne({username: username}, (err, user) => {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                if(!user) res.redirect("/");
                else {
                    // if the user is not private view the blog it doesn't matter if you're logged in or not
                    if(!user.private) viewBlog();
                    else {
                        // check if the user is not logged in, if they aren't, they cannot view a private blog
                        if(!(req.session && req.session.userId)) res.render("privateAccount", {name: username});
                        else {
                            let canView = false;
                            // get blog owner's friends, check if logged in user is in that list
                            user.friends.forEach(friendID => {
                                if(friendID == req.session.userId) canView = true;
                            });
                            canView ? viewBlog() : res.render("privateAccount", {name: username, friend: false});
                        }
                    }
                }
            }
        });
    });

    app.get("/profile", (req, res) => {
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            // Find logged in user's profile
            User.findById(req.session.userId).populate("friendRequests").exec((err, user) => {
                if(err) {
                    console.log(err);
                    res.redirect("/");
                }
                res.render("profile", {
                    user: user,
                    error: req.flash("error"),
                    tab: req.flash("tab"),
                    friendError: req.flash("friendError"),
                    friendRequests: user.friendRequests
                });
            });
        }
    });

    app.get("/friendrequests", (req, res) => {
        // Check if user is logged in
        if(!(req.session && req.session.userId)) res.redirect("/");
        // Find all user's in logged in user's friend requests
        else {
            // Find logged in user
            User.findById(req.session.userId).populate("friendRequests").exec((err, user) => {
                res.render("friendReqs", {reqs: user.friendRequests});
            });
        }
    });

    app.get("/friends", (req, res) => {
        // if the user is logged in they can't have friends
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            // find logged in user's friends
            User.findById(req.session.userId).populate("friends").exec((err, user) => {
                if(err) {
                    console.log(err);
                    res.redirect("/");
                } else res.render("friends", {friends: user.friends});
            });
        }
    });

    app.get("/dm", (req, res) => {
        // Check if user is logged in
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            // find logged in user
            User.findById(req.session.userId, (err, user) => {
                res.render("dm", {username: user.username});
            });
        }
    });

    // POST REQUESTS
    app.post("/search", (req, res) => {
        let search = req.body.search;
        // find the username inside db
        User.findOne({username: search}, (err, user) => {
            if(err) {
                console.log(err);
                res.redirect("/");
            } else {
                // if there are no users, we dont care if the user is logged in or not so false is fine
                if(!user) res.render("users", {search: search, loggedIn: false});
                else {
                    // check if user is logged in AND matches the searched user
                    if(!(req.session && req.session.userId)) res.render("users", {search: search, user: user, loggedIn: false});
                    else {
                        loggedIn = false;
                        // check if logged in user is viewing themselves
                        User.findById(req.session.userId, (err, foundUser) => {
                            if(err) {
                                console.log(err);
                                res.redirect("/");
                            } else {
                                if(user.username === foundUser.username) loggedIn = true;
                                // Check if the searched user has the logged in user in their friends list
                                let inFriendList = false;
                                if(user.friends.filter(friendID => friendID == foundUser._id.toString()).length > 0)
                                    inFriendList = true;
                                res.render("users", {search: search, user: user, loggedIn: loggedIn, inFriendList: inFriendList});
                            }
                        });
                    }
                }
            }
        });
    });

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
        User.findOne({email: req.body.user.email}, async (err, user) => {
            // if an error occured, or if the user is not found (falsey), or if the password does not match
            await !bcrypt.compare(req.body.user.password, user.password).then(loginSuccess => {
                if(err || !user || !loginSuccess) {
                    res.render("login", {error: "Incorrect username or password"});
                } else {
                    // i think this sends a cookie to the browser
                    req.session.userId = user._id;
                    res.redirect("/blog");
                }
            });
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
            await User.findOneAndUpdate({_id: req.session.userId}, user, (err) => {
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

    app.post("/friendreq/:username", (req, res) => {
        // check if the user is logged in
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            // Find the user and add the logged in user's id to their friend requests
            User.findOne({username: req.params.username}, async (err, user) => {
                // check if logged in user is already in friend list or friend requests list
                if(user.friends.filter(friendID => friendID == req.session.userId).length > 0) {
                    req.flash("friendError", "Already friends with " + user.username);
                    res.redirect("/profile");
                } else {
                    let objectID = mongoose.Types.ObjectId(req.session.userId);
                    user.friendRequests.push(objectID);
                    await user.save();
                    res.redirect("/blog");
                }
            });
        }
    });

    app.post("/acceptreq/:acceptedUser", (req, res) => {
        // Check if user is logged in (a few things might have caused them not to be)
        if(!(req.session && req.session.userId)) res.redirect("/login");
        else {
            // Add acceptedUser to loggedin user's friends
            User.findById(req.session.userId)
            .populate("friends")
            .populate("friendRequests")
            .exec((err, user) => {
                if(err) {
                    console.log(err);
                    res.redirect("/profile");
                } else {
                    // Find accepted user
                    User.findOne({username: req.params.acceptedUser}, async (err, acceptedUser) => {
                        if(err) {
                            console.log(err);
                            res.redirect("/");
                        } else {
                            // remove new friend from requests and add them to friends
                            user.friends.push(acceptedUser);
                            // create new array from the old friend requests without the new friend
                            let newReqs = user.friendRequests.filter(friendReq => {friendReq !== acceptedUser});
                            user.friendRequests = newReqs;
                            await user.save();
                            res.redirect("/profile");
                        }
                    });
                }
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