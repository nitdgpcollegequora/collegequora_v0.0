let mongoose = require('mongoose');

// This is a database schema for the accounts relation

let accountschema = mongoose.Schema({
    username:{
        type: String
    },
    email:{
        type:String
    },
    password:{
        type:String
    }
});

let account = module.exports = mongoose.model('account', accountschema);
