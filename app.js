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

app.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    Account.findOne({username:username},(err,accounts)=>{
      if(err)
      console.log(err);
      else{
        if(accounts)
        {
          Account.findOne({password:password},(err,accounts)=>{
            if(err)
            console.log(err);
            else{
              if(accounts)
              {
                res.redirect('/');
              }
              else {
                res.redirect('/login');
              }
            }
          })
        }
        else {
          res.redirect('/login');
        }
      }
    })
});

// you ask for the register page
app.get('/register', (req, res) => {
    messages = [];
    res.render('register', {messages: messages});

});

// when user enters a email and password for a new account
app.post('/register', (req, res) =>{
    let account = new Account();
    account.username = req.body.username;
    account.email = req.body.email;
    account.password = req.body.password;
    if(account.email.length)
    {
      Account.findOne({email:account.email},(err,accounts)=>{
        if(err)
        console.log(err);
        else {
          if(accounts)
          {
            res.redirect('/register');
          }
          else {
            if(account.username.length)
            {
              Account.findOne({username:account.username},(err,accounts)=>{
                if(err)
                console.log(err);
                else {
                  if(accounts)
                  {
                    res.redirect('/register');
                  }
                  else {
                    if(account.password.length)
                    {
                      account.save(err=>{
                        if(err)
                        console.log(err);
                        else {
                          res.redirect('/login');
                        }
                      })
                    }
                    else {
                      res.redirect('/register');
                    }
                  }
                }
              })
            }
            else {
              res.redirect('/register');
            }
          }
        }
      })
    }
    else {
      res.redirect('/register');
    }
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
