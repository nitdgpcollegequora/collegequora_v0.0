let mongoose = require('mongoose');

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
    no_ques:{
      type : Number
    }
});

let data = module.exports = mongoose.model('data',dataschema);
