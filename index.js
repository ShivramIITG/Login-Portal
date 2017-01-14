var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
app.use(session({secret: "LOL"}));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');

var userSchema = mongoose.Schema({
    username: String,
    name: String,
    password: String
});
var User = mongoose.model("User", userSchema);


app.set('views','./views');
app.set('view engine', 'ejs');

app.use(upload.array());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data
app.use('/static', express.static('public'));

app.get('/home', function(req, res){
    if(req.session.user)
        res.render('home', {user: req.session.user});
    else
        res.render('login');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function(req, res){
    if(!req.body.username || !req.body.password){
        res.render('login', {message: "Fill all the fields"});
    }
    else{
        var info=req.body;
        User.findOne({username: info.username,password: info.password}, function (err,user) {
            if(err){
                res.render('login', {message: "Oops! Database error"});
            }

            else if(!user){
                res.render('login', {message: "Invalid Credentials"});
            }

            else{
                req.session.user = user;
                res.redirect('/home');
            }
        });
    }
});

app.get('/form', function(req, res){
    res.render('form');
});

app.post('/form', function(req, res){
    //Get the parsed information
    var info=req.body;
    if(!info.username || !info.name || !info.password){
        res.render('form', {message: "Fill all the fields"});
    }
    else{
        User.findOne({username: info.username}, function (err,user) {
            if(err){
                res.render('form', {message: "Oops! Database error"});
            }

            else if(user){
                res.render('form', {message: "Username Already Exists! Login or choose another user id"});
            }

            else{
                var newUser = new User({
                    username: info.username,
                    name: info.name,
                    password: info.password
                });
                newUser.save(function(err, res1){
                    if(err)
                        res.render('form', {message: "Oops! Database error"});
                    else
                        res.render('form', {message: "Successfully registered", user: info});
                });
            }
        });

    }
});


app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/login');
});


app.listen(3000);