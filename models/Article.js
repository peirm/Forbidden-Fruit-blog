const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
//引入事件格式化对象
const moment = require('moment');

const ArticleSchema = new Schema ({
    _id:{
        type:String,
        unique:true,
        'default':shortid
    },
    title:String,
    stitle:String,
    type:{
        type:String,
        default:"说说"
    },
    //文章类别
    category:{
        type:String,
        ref:'Category'
    },
    tags:{
        type:Array
    },
    keywords:String,
    sImg:{
        type:String,
        default:"/upload/image/defaultImg.jpg"
    },
    discription:String,
    content:String,
    date:{
        type:Date,
        default:Date.now
    },
    //更新时间
    updateDate:{
        type:Date,
        default:Date.now
    },
    //发布日期
    postDate:{
        type:Date,
        default:Date.now
    },
    //文档作者
    author:{
        type:String,
        ref:"AdminUser"
    },
    //用户头像
    authorLogo:String,
    //是否显示，默认显示
    state:{
        type:Boolean,
        default:true
    },
    //是否置顶，默认为不置顶，0为不置顶，1为置顶
    isTop:{
        type:Number,
        default:0
    },
    //查看该文章的用户数
    clickNum:{
        type:Number,
        default:0
    },
    //收藏数
    collectNum:{
        type:Number,
        default:0
    },
    //收藏该文章的用户ID集合
    collectUserIds:[],
    //转发数
    copyNum:{
        type:Number,
        default:0
    },
    //评论数
    commentNum:{
        type:Number,
        default:0
    },
    //评论该文章的用户ID集合
    commentsIds:[],
    //点赞数
    likeNum:{
        type:Number,
        default:0
    },
    //点赞该文章的用户的ID集合
    likeUserIds:[],
    //来源 1为原创，2为转载
    from:{
        type:String,
        default:'1'
    },

    //插件相关属性
    repostioryPath:String,//git 知识库地址
    downPath:String,//git下载地址
    previewPath:String//插件预览地址

});
ArticleSchema.statics = {
    //更新评论数
    updateCommentNum:(articleId,key,callback) => {
        Article.findOne({'_id':articleId},'commentNum',(err,doc) => {
            if(err) {
                res.end(err)
            }
            if(key === 'add') {
                doc.commentNum = doc.commentNum + 1;
            }else if (key === 'del') {
                doc.commentNum = doc.commentNum -1;
            }
            doc.save(err => {
                if(err) throw err;
                callback();
            })
        })
    }
}
const Article = mongoose.model('Article',ArticleSchema);
module.exports = Article;