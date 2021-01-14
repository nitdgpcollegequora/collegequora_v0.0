const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const random = require('random');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');

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



app.get('/home/:id', (req, res) => {
  let id =req.params.id;
  Account.findOne({_id:id},(err,user)=>{
    if(err)
    console.log(err);
    else {
      if(user.login)
      {
      data.find({}, function (err, datas) {
          if (err)
              console.log(err);
          else {
              res.render('index', {datas: datas,user:user,success:req.flash('success'),error:req.flash('error')});
          }
      })
    }
    else {
      req.flash('error','please login');
      res.redirect('/login');
    }
  }
  })
});

app.get('/question/:uid', (req, res) => {
  let uid = req.params.uid;
  Account.findOne({_id:uid},(err,user)=>{
    if(err)
    console.log(err);
    else if(!user)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!user.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else {
      res.render('question',{uid:uid});
    }
  })
});

// let uid = req.params.uid;
// Account.findOne({_id:uid},(err,user)=>{
//   if(err)
//   console.log(err);
//   else if(!user)
//   {
//     req.flash('error','please login');
//     res.redirect('/login');
//   }
//   else if(!user.login)
//   {
//     req.flash('error','please login');
//     res.redirect('/login');
//   }
//   else {
//
//   }
// })

app.post('/question/:uid', (req, res) => {
  let uid = req.params.uid;
  Account.findOne({_id:uid},(err,user)=>{
    if(err)
    console.log(err);
    else if(!user)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!user.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else {
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
    res.render('login',{error:req.flash('error'),success:req.flash('success')});
});

app.post('/login',(req,res)=>{
  let email = req.body.email;
  let password = req.body.password;
  if(!email||!password)
  {
    req.flash('error','fill all the fields');
    res.redirect('/login');
  }
  else {
    Account.findOne({email:email},(err,user)=>{
      if(err)
      console.log(err);
      else {
        if(!user)
        {
          req.flash('error','email does not exist');
          res.redirect('/login');
        }
        else {
          let username = user.username;
          bcrypt.compare(password,user.password,(err,matched)=>{
            if(err)
            console.log(err);
            else if(matched)
            {
              user.login =1;
              user.save(err=>{
                if(err)
                console.log(err);
                else {
                  req.flash('success',`welcome ${username}`);
                  res.redirect('/home/'+user._id);
                }
              })
            }
            else {
              req.flash('error','wrong password');
              res.redirect('/login');
            }
          })
        }
      }
    })
  }
})

app.get('/logout/:uid',(req,res)=>{
  let uid = req.params.uid;
  Account.findOne({_id:uid},(err,user)=>{
    if(err)
    console.log(err);
    else if(!user)
    {
      req.flash('error','please register');
      res.redirect('/register');
    }
    else {
      user.login = 0;
      user.save(err=>{
        if(err)
        console.log(err);
        else {
          req.flash('success','successfully logged out');
          res.redirect('/login');
        }
      })
    }
  })
})

// you ask for the register page
app.get('/register', (req, res) => {
    messages = [];
    res.render('register', {messages: messages});

});

// when user enters a email and password for a new account
app.post('/register', (req, res) =>{
  let email = req.body.email;
let username = req.body.username;
let password = req.body.password;
if(!email || !username || !password)
{
  req.flash('error','fill all fields');
  res.redirect('/register');
}
else
{
    Account.findOne({email:email},(err,users)=>{
      if(err)
      console.log(err);
      else {
        console.log(users);
        if(users)
        {
          req.flash('error','this email is already in use');
          res.redirect('/register');
        }
        else
        {
          let newuser = new Account({
            email,
            username,
            password
          })
          bcrypt.genSalt(10,(err,salt)=>
          bcrypt.hash(newuser.password,salt,(err,hash)=>{
            if(err)
            console.log(err);
            newuser.password = hash;
            newuser.save(err=>{
              if(err)
              console.log(err);
              else {
                res.redirect('/login');
              }
            })
          }))
        }


      }
    })
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
      else if(!user)
      {
        req.flash('error','please login');
        res.redirect('/login');
      }
      else if(!user.login)
      {
        req.flash('error','please login');
        res.redirect('/login');
      }
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
    Account.findOne({_id:uid},(err,user)=>{
      if(err)
      console.log(err);
      else if(!user)
      {
        req.flash('error','please login');
        res.redirect('/login');
      }
      else if(!user.login)
      {
        req.flash('error','please login');
        res.redirect('/login');
      }
      else {

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
      }
    })
})

app.get('/delete_question/:qid/:uid', (req , res)=>{
  let qid = req.params.qid;
  let uid = req.params.uid;
  Account.findOne({_id:uid},(err,user)=>{
    if(err)
    console.log(err);
    else if(!user)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!user.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else {

      data.deleteOne({_id:qid},(err)=>{
        if(err)
        console.log(err);
        else{
          req.flash('success','Deleted sucessfully');
          res.redirect('/home/'+uid);
        }
      });
    }
  })
});

app.get('/present/:id/:index',(req ,res)=>{
  let id =req.params.id;
  let index = req.params.index;
  Account.findOne({_id:id} , (err , accounts)=>{
    if(err)
    console.log(err);
    else if(!accounts)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!accounts.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else{
      accounts.attendance[index].present = accounts.attendance[index].present + 1;
      // console.log(accounts.attendance[index]);
      accounts.save((err)=>{
        if(err)
          console.log(err);
          else
          {
            // console.log("updated");
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
    else if(!accounts)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!accounts.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else{
      accounts.attendance[index].absent = accounts.attendance[index].absent + 1;
      accounts.save((err)=>{
        if(err)
          console.log(err);
          else
          {
            // console.log("updated");
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
    else if(!user)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!user.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else {
      res.render('profile',{user:user,error:req.flash('error')})
    }
  })
})

app.post('/profile/:id/course',(req,res)=>{
  let coursename = req.body.course;
  let id = req.params.id;
 if(!coursename)
 {
   req.flash('error','fill the course');
   res.redirect('/profile/'+id);
 }
 else {
   Account.findOne({_id:id},(err,user)=>{
     if(err)
     console.log(err)
     else if(!user)
     {
       req.flash('error','please login');
       res.redirect('/login');
     }
     else if(!user.login)
     {
       req.flash('error','please login');
       res.redirect('/login');
     }
     else{
       let flag=0;
       for(let i=0;i<user.attendance.length;i++){
         if(user.attendance[i].sub_code == coursename)
         {
           flag=1;
           break;
         }
       }
       if(flag)
       {
         req.flash('error','course is already there');
         res.redirect('/profile/'+id);
       }
       else {
         let course = {sub_code: coursename,present: 0,absent: 0}
         // console.log(course);
         user.attendance.push(course);
         user.save((err)=>{
           if(err)
           console.log(err);
           else
           res.redirect('/profile/'+id);
         });
       }
     }
   });
 }
})

app.get('/delete/:uid/:index',(req,res)=>{
  let uid = req.params.uid;
  let index = req.params.index;
  Account.findOne({_id:uid},(err,user)=>{
    if(err)
    console.log(err);
    else if(!user)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else if(!user.login)
    {
      req.flash('error','please login');
      res.redirect('/login');
    }
    else {
      user.attendance.splice(index,index+1);
      user.save((err)=>{
        if(err)
        console.log(err);
        else {
          req.flash('success','deleted course successfully');
          res.redirect('/profile/'+uid);
        }
      })
    }
  })
})

app.listen('3000', (err) => {
  if (err)
        console.log(err);
    else
        console.log(`app listening at 3000`);
});
