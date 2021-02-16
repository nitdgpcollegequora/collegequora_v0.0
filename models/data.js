let mongoose = require('mongoose');

let reply_schema = mongoose.Schema({
  u1name : {
    type : String
  },
  u2name : {
    type : String
  },
  text : {
    type : String
  }
})

let comment_schema = mongoose.Schema({
  u1name : {
    type : String
  },
  u2name : {
    type : String
  },
  text : {
    type : String
  },
  replies : [reply_schema]
})

let dataschema = mongoose.Schema({
    name:{
        type : String
    },
    content:{
        type : String
    },
    uname:{
        type : String
    },
    no_ques:{
      type : Number
    },
    comments : [comment_schema]
});

let data = module.exports = mongoose.model('data',dataschema);
