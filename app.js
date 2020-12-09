const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const url = require('url');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;

db.once('open', function () {
    console.log('connected');
});

db.on('error', function (err) {
    console.log(err);
});

let data = require('./models/data');

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

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword');
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


app.listen('3000', (err) => {
    if (err)
        console.log(err);
    else
        console.log('app listening');
});
