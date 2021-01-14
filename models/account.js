let mongoose = require('mongoose');

// This is a database schema for the accounts relation
let student_attendance = mongoose.Schema({
    sub_code:{
        type: String
    },
    present:{
        type: Number
    },
    absent:{
        type: Number
    }
});

let accountschema = mongoose.Schema({
    username:{
        type: String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    otp:{
        type:Number
    },
    login:{
      type : Number
    },
    attendance:[student_attendance]
});

let account = module.exports = mongoose.model('account', accountschema);
