const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost/test',{ useNewUrlParser: true,useUnifiedTopology: true  });
let db = mongoose.connection;

db.once('open',function(){
    console.log('connected');
});

db.on('error',function(err){
    console.log(err);
});

let data = require('./models/data');

app.get('/',(req,res)=>{
    data.find({},function(err,datas){
        if(err)
        console.log(err);
        else{
            res.render('index',{datas:datas});
        }
    })
});

app.get('/question',(req,res)=>{
    res.render('question');
});

app.post('/question',(req,res)=>{
    let Data = new data();
    Data.name = req.body.subjectcode;
    Data.content = req.body.problem;
    Data.save(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/');
        }
    })
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.get('/forgotpassword',(req,res)=>{
    res.render('forgotpassword');
});

app.listen('3300',(err)=>{
    if(err)
    console.log(err);
    else
    console.log('app listening')
}) ;