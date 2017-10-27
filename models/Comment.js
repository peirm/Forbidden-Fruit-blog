const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

const CommentModel = new Schema({
    _id:{
        type:String,
        unique:true,
        'default':shortid
    },
    articleId:String,
    commenter:String,
    commenterId:String,
    commenterLogo:String,
    commentTime:{type:Date,default:Date.now},
    comment:String,
    answerNum:{type:Number,default:0},
    answers:[]
});
const Comment = mongoose.model('Comment',CommentModel);
module.exports = Comment;