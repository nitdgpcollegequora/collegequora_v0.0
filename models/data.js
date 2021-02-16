let mongoose = require('mongoose');

// schema for replies
let reply = mongoose.Schema({
    to:{
        type : String
    },
    from:{
        type : String
    },
    text:{
        type : String
    }
});

// schema for comments
let comment = mongoose.Schema({
    to:{
        type : String
    },
    from:{
        type : String
    },
    text:{
        type : String
    },
    replies : [reply]
});

let dataschema = mongoose.Schema({
    name:{
        type : String
    },
    content:{
        type : String
    },
    uid:{
        type : String
    },
    username:{
        type : String
    },
    comments : [comment]
});

let data = module.exports = mongoose.model('data',dataschema);
