let mongoose = require('mongoose');
const { stringify } = require('querystring');

// create a model class
let Survey = mongoose.Schema({
    Title: String,
    Date: String,
    User: String,
    Description: String,
    Question_1: String,
    Answer_1: String,
    Answer_2: String,
    Question_2: String,
    Answer_3: String,
    Question_3: String
},
{
  collection: "survey"
});
  
module.exports = mongoose.model('Survey', Survey);
