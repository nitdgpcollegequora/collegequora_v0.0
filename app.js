const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const random = require('random');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

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

app.get('/profile' , (req , res)=>{
  res.render('profile');
})

app.get('/home/:id', (req, res) => {
  let id =req.params.id;
  Account.findOne({_id:id},(err,user)=>{
    if(err)
    console.log(err);
    else {
      data.find({}, function (err, datas) {
          if (err)
              console.log(err);
          else {
              res.render('index', {datas: datas,user:user,success:req.flash('success')});
          }
      })
    }
  })
});

app.get('/question/:uid', (req, res) => {
    let uid = req.params.uid;
    res.render('question',{uid:uid});
});

app.post('/question/:uid', (req, res) => {
  let uid = req.params.uid;
    let Data = new data();
    Data.uid = uid;
    Data.name = req.body.subjectcode;
    Data.content = req.body.problem;
    Data.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/home/'+uid);
        }
    })
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
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
                res.redirect('/home/'+accounts._id);
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

app.get('/edit_question/:qid/:uid' , (req , res)=>{
    let qid = req.params.qid;
    let uid = req.params.uid;
    Account.findOne({_id:uid},(err,user)=>{
      if(err)
      console.log(err)
      else {
        data.findOne({_id:qid} , (err , datas)=>{
          if(err)
          console.log(err);
          else{
              res.render('edit_question.ejs' , { data:datas,user:user});
          }
      });
      }
    })
});

app.post('/edit_question/:qid/:uid' , (req , res)=>{
    let qid = req.params.qid;
    let subjectcode =req.body.subjectcode;
    let problem = req.body.problem;
    let uid = req.params.uid;
        let Data = new data;
        Data = {
            name : subjectcode.trim() ,
            content : problem.trim()
        };

        data.updateOne({_id:qid} , Data , (err)=>{
            if(err)
            console.log(err);
            else{
                res.redirect('/home/'+uid);
            }
        })
})

app.get('/delete_question/:qid/:uid', (req , res)=>{
  let qid = req.params.qid;
  let uid = req.params.uid;
  data.deleteOne({_id:qid},(err)=>{
    if(err)
    console.log(err);
    else{
      req.flash('success','Deleted sucessfully');
      res.redirect('/home/'+uid);
    }
  });
});

app.get('/present/:id/:index',(req ,res)=>{
  let id =req.params.id;
  let index = req.params.index;
  Account.findOne({_id:id} , (err , accounts)=>{
    if(err)
    console.log(err);
    else{
      accounts.attendance[index].present = accounts.attendance[index].present + 1;
      console.log(accounts.attendance[index]);
      accounts.save((err)=>{
        if(err)
          console.log(err);
          else
          {
            console.log("updated");
            res.redirect('/profile/'+id);
          }
          

      })
    }
  });
})

app.get('/absent/:id/:index',(req ,res)=>{
  let id =req.params.id;
  let index = req.params.index;
  Account.findOne({_id:id} , (err , accounts)=>{
    if(err)
    console.log(err);
    else{
      accounts.attendance[index].absent = accounts.attendance[index].absent + 1;
      accounts.save((err)=>{
        if(err)
          console.log(err);
          else
          {
            console.log("updated");
            res.redirect('/profile/'+id);
          }
        
    });
  }
    
  });
})

app.get('/profile/:id',(req,res)=>{
  let id = req.params.id;
  Account.findOne({_id:id},(err,user)=>{
    if(err)
    console.log(err)
    else {
      res.render('profile',{user:user})
    }
  })
})

app.post('/profile/:id/course',(req,res)=>{
  let coursename = req.body.course;
  let id = req.params.id;

  Account.findOne({_id:id},(err,user)=>{
    if(err)
    console.log(err)
    else{
      let course = {sub_code: coursename,present: 0,absent: 0}
      console.log(course);
      user.attendance.push(course);
      user.save((err)=>{
        if(err)
        console.log(err);
        else
        res.redirect('/profile/'+id);
      });
      
    }
  });
})



app.listen('3000', (err) => {
  if (err)
        console.log(err);
    else
        console.log(`app listening at 3000`);
});
