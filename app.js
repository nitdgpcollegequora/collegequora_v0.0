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
// importing account and data schema
const Account = require('./models/account');
const data = require('./models/data');

// storing all data to a local database test.
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;


db.once('open', function () {
    console.log('connected');
});

db.on('error', function (err) {
    console.log(err);
});

app.get('/' , (req,res)=>{
  res.render('landing');
});

app.get('/index', (req, res) => {
    data.find({}, function (err, datas) {
        if (err)
            console.log(err);
        else {
            res.render('index', {datas: datas});
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
    messages = [];
    res.render('forgotpassword', {messages: messages});
});

app.post('/forgotpassword', (req, res) => {

    let email = req.body.email;
    if(email.length === 0) {
        messages = [];
            messages.push({fail: 1, message: 'Enter a valid email id.'});
            return res.render('forgotpassword', {messages: messages});
    }
    Account.find({email: email}, (err, accounts) => {
        if(!accounts){
            console.log('There exist no account with this email id');
            //res.redirect('register');
            messages = [];
            messages.push({fail: 1, message: 'There is no email with this email id.'});
            return res.render('forgotpassword', {messages: messages});
        } else {
            let otp = random.int(min = 1000, max = 9999);
            //console.log('HI1');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'noobgalaxy6@gmail.com',
                pass: 'Asxz@1234.'
                }
            });
            //console.log('HI2');
            var mailOptions = {
                from: 'noobgalaxy6@gmail.com',
                to: email,
                subject: 'Sending Email using Node.js',
                text: `Your otp for password change of nitdgp quora account is: ${otp}`
            };
            //console.log('HI3');
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            accounts.otp = otp;
            res.render('otp');
        }
    });

});

// when user gives our otp
app.post('/otp', (req, res) => {
    let otp = req.body.otp;
    let password = req.body.password;
    Account.find({otp: otp}, (err, accounts) => {
        if (err) {
            console.log(err);
        } else if (!accounts) {
            console.log('Enter a valid otp');
            res.render('otp');
        } else {
            console.log('Valid otp entered');
            accounts.password = password;
            accounts.otp = 0;
            res.redirect('login');
        }
    });
});

app.get('/edit_question/:id' , (req , res)=>{
    let id = req.params.id;
    data.findOne({_id:id} , (err , datas)=>{
        if(err)
        console.log(err);
        else{
            res.render('edit_question.ejs' , { data:datas});
        }
    });
});

app.post('/edit_question/:id' , (req , res)=>{
    let id = req.params.id;
    let subjectcode =req.body.subjectcode;
    let problem = req.body.problem;

        let Data = new data;
        Data = {
            name : subjectcode.trim() ,
            content : problem.trim()
        };

        data.updateOne({_id:id} , Data , (err)=>{
            if(err)
            console.log(err);
            else{
                res.redirect('/');
            }
        })
})

app.get('/delete_question/:id', (req , res)=>{
  let id = req.params.id;
  data.deleteOne({_id:id},(err)=>{
    if(err)
    console.log(err);
    else{
      res.redirect('/');
    }
  });
});

app.listen('3000', (err) => {
    if (err)
        console.log(err);
    else
        console.log(`app listening at 3000`);
});
