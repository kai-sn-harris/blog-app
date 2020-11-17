const express  = require("express"),
app            = express(),
http           = require("http").createServer(app),
mongoose       = require("mongoose"),
sessions       = require("client-sessions"),
methodOverride = require("method-override"),
flash          = require("connect-flash");

if(process.env.NODE_ENV !== "production") require("dotenv").config();
const PORT = process.env.PORT;

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(sessions({
    cookieName: "session",
    secret: process.env.SECRET,
    duration: 60*10*30 // 30 mins
}));
app.use(flash());

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

// routes
require("./routes")(app);

http.listen(PORT, console.log(`Serving port ${PORT} at http://localhost:${PORT}`));