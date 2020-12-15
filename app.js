const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const random = require('random');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// storing all data to a local database test.
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
// importing account and data schema
const Account = require('./models/account');
const data = require('./models/data');


db.once('open', function () {
    console.log('connected');
});

db.on('error', function (err) {
    console.log(err);
});

app.get('/', (req, res) => {
    data.find({}, function (err, datas) {
        if (err)
            console.log(err);
        else {
            res.render('index', { datas: datas });
        }
    })
});

app.get('/question', (req, res) => {
    res.render('question');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});



app.post('/question', (req, res) => {
    let Data = new data();
    Data.name = req.body.subjectcode;
    Data.content = req.body.problem;
    Data.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    })
});

app.get('/login', (req, res) => {
    res.render('login');
});

// you ask for the register page
app.get('/register', (req, res) => {
    messages = [];
    res.render('register', {messages: messages});

});

// when user enters a email and password for a new account 
app.post('/register', (req, res) =>{
    let messages = [];
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;

    //let check = 0; // no errors at first.
    //console.log(email, '1234');
    //console.log(username);

    // The way the code is written in this way is due to the asynchronous running of code whihc leads to 
    // incorrect results. This code will be changed when we know a better way to write this code.
    if(username.length == 0) {  // invalid username.
        check = 1;
        messages.push({fail: 1, message: 'Add a valid username.'});
        res.render('register', {messages: messages});
    } else { // check if username is already linked to a account.
        Account.find({username: username}, (err, accounts) => {
            if(err){ console.log(err); console.log('HI1');}
            else if(!accounts) { // valid username
                messages.push({fail: 0, message: 'Valid username.'});
                console.log('HI2');

                if(email.length == 0) { // invalid email.
                    check = 1;
                    messages.push({fail: 1, message: 'Add a valid email id'});
                    res.render('register', {messages: messages});

                } else {  // check if an account is present with this email or not
                    Account.find({email: email}, (err, accounts) => {
                        if(err){console.log(err);  console.log('HI1');}
                        else if(!accounts) { // valid email
                            console.log('HI2');
                            messages.push({fail: 0, message: 'Valid email'});
                            if(password.length == 0) { // invalid password
                                check = 1;
                                console.log('HI1');
                                messages.push({fail: 1, message: 'Add a password.'});
                            } else {
                                console.log('HI2');
                                messages.push({fail: 0, message: 'Valid password.'});

                                messages.push({fail: 0, message: 'Account added successfully'});
                                console.log(messages);
                                res.redirect('/login');
                            }
                        }
                        else {
                            check = 1;
                            console.log('HI3');
                            messages.push({fail: 1, message: 'This email is already linked to a account.'});
                            res.render('register', {messages: messages});
                            //console.log(messages);
                        }
                    });
                }
            }
            else {
                //check = 1;
                //console.log(check);
                console.log('HI3');
                messages.push({fail: 1, message: 'This username is already linked to a account.'});
                res.render('register', {messages: messages});
                //console.log(messages);

                
            }
        });
    }

    //  This is the part of the code that gave incorrect results.
    //console.log(check);
    // if (check === 0) { // all credentials are correct.
    //     //console.log(messages);
    //     let account = new Account();
    //     account.username = username;
    //     account.email = email;
    //     account.password = password;
    //     account.save((err) => {
    //         if (err) console.log(err);
    //         else {
    //             messages.push({fail: 0, message: 'Account added successfully'});
    //             console.log(messages);
    //             res.redirect('/login');
    //         }
    //     });
    // } else { // invalid credentials.
    //     messages.push({fail: 1, message: 'Cannot create an account with given credentials.'});
    //     //res.render('./register', {messages: messages});
    //     console.log(messages);
    //     res.render('register');
    // }

});

app.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword');
});

app.post('/forgotpassword', (req, res) => {
    let otp = random.int(min = 1000, max = 9999);
    console.log('HI1');
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'noobgalaxy6@gmail.com',
        pass: 'Asxz@1234.'
        }
    });
    console.log('HI2');
    var mailOptions = {
        from: 'noobgalaxy6@gmail.com',
        to: req.body.email,
        subject: 'Sending Email using Node.js',
        text: `${otp}`
    };
    console.log('HI3');
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    console.log('HI4');
    res.redirect('login');
});

app.listen('3000', (err) => {
    if (err)
        console.log(err);
    else
        console.log(`app listening at 3000`);
});
