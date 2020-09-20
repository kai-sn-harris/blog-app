const express = require("express"),
app = express(),
mongoose = require("mongoose"),
sessions = require("client-sessions"),
bcrypt = require("bcryptjs");

if(process.env.NODE_ENV !== "production") require("dotenv").config();
const PORT = process.env.PORT;

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index", {title: "Home"});
});

app.listen(PORT, console.log(`Serving port ${PORT} at http://localhost:${PORT}`));