const express = require('express');
const router = express.Router();
//引入数据库操作文件
const connect = require('../models/connect.js');
const Article = require('../models/Article.js');
const User = require('../models/User.js');
const Comment = require('../models/Comment.js');
const Skin = require('../models/Skin.js');
//数据库操作的方法集合
const Db = require('../models/db.js');

const url = require('url');
const moment = require('moment');

const upload = require('../models/upload.js');
const fs = require('fs');
const gm = require('gm');


//检查用户是否登录
function isLogined (req,res,next) {
    if(!req.session.user) {
        return res.end('用户还未登录');
    }
    next();
}
function isLogin (req,res,next) {
    if(req.session.user) {
        return res.send('用户已经登录');
    }
    next();
}

/* GET home page. */
router.get('/',(req, res, next) => {
      res.render('web/index', {
        title: 'Forbidden Fruit',
          user:req.session.user
      });
});
//说说发布
router.post('/talking',isLogined,(req,res,next) => {
    Db.addOneTalking(Article,User,req,res);
});
//根据参数获取一个用户的说说或日志
router.get('/oneUser',(req,res,next) => {
    Db.findArticlesByConditions(Article,{author:req.query.username,type:req.query.type},(err,articles) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',articles:articles});
    })
});
//日志发布页面
router.get('/postDiary',(req,res,next) => {
    res.render('web/diaryPost',{
        title:'日志发布',
        user:req.session.user
    })
});
router.post('/postDiary',(req,res,next) => {
    Db.addOneDiary(Article,User,req,res);
});
//获取所有的说说和日志
router.get('/allArticles',(req,res,next) => {
    if(!req.query.by) {
        Db.findArticlesByConditions(Article,{state:true},(err,articles) => {
            if(err) {
                return res.end(err);
            }
            return res.json({success:'success',articles:articles});
        })
    }else if (req.query.by) {
        Db.findArticlesByConditions(Article,{$or:[{type:req.query.by},{tags:req.query.by},{author:req.query.by},{type:req.query.type}],state:true},(err,articles) => {
            if(err) {
                return res.end(err);
            }
            res.json({success:'success',articles:articles});
        })
    }
});
//获取所有的标签
router.get('/allTags',(req,res,next) => {
    Db.getAllTags(Article,function (err,allTags) {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',allTags:allTags})
    })
});
//获取最近的文章
router.get('/recentArticles',(req,res,next) => {
    Db.getRecentArticles(Article,(err,recentArticles) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',recentArticles:recentArticles});
    })
});
//记录文章阅读量
router.get('/viewArticle',(req,res,next) => {
    Db.viewArticle(Article,req.query._id,(err,article) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:article});
    })
});

//文章收藏
router.get('/collectArticle',isLogined,(req,res,next) => {
    // console.log(req.query._id);
    Db.collectArticle(Article,User,req.query._id,req.session.user._id,(err,user,article) => {
        if(err) {
            return res.end(err);
        }
        req.session.user = user;
        res.json({success:'success',data:article});
    })
});
//文章转发
router.get('/copyArticle',isLogined,(req,res,next) => {
    Db.copyArticle(Article,User,req.query._id,req.session.user._id,(err,user,article) => {
        if(err) {
            return res.end(err);
        }
        req.query.user = user;
        res.json({success:'success',data:article})
    })
});
//文章点赞
router.get('/likeArticle',isLogined,(req,res,next) => {
    Db.likeArticle(Article,req.query._id,req.session.user._id,(err,article) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',data:article});
    })
});
//取消文章点赞
router.get('/unlikeArticle',isLogined,(req,res,next) => {
    Db.unlikeArticle(Article,req.query._id,req.session.user._id,(err,article) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',data:article});
    })
});
//发表文章评论
router.post('/commentArticle',isLogined,(req,res,next) => {
    Db.commentArticle(Article,User,Comment,req.body.article_id,req.session.user,req.body.comment,(err,article,comments) => {
        if(err) {
            return res.end(err);
        }else {
            res.json({success:'success',article:article,comments:comments})
        }
    });
});
//获取一篇文章所有的评论
router.get('/allComments',(req,res,next) => {
    Db.findCommentsByConditions(Comment,{articleId:req.query.article_id},(err,comments) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',comments:comments});
    })
});
//删除一篇文章
router.get('/deleteArticle',isLogined,(req,res,next) => {
    Db.deleteArticle(Article,User,Comment,req.query.article_id,req.session.user._id,(err,state) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:null})
    })
});
//编辑一篇文章
router.get('/editDiary',isLogined,(req,res,next) => {
     res.render('web/editDiary',{
         title:'日志编辑',
         user:req.session.user
     })
});
//获取一篇文章的信息
router.get('/getOneArticle',(req,res,next) => {
    Db.findArticleById(Article,req.query.article_id,(err,article) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:article});
    })
});
//保存文章的修改
router.post('/saveEdit',(req,res,next) => {
    Db.saveEditArticle(Article,req.body,(err,article) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',article:article});
    })
});
//文章详情
router.get('/articleInfo',(req,res,next) => {
    res.render('web/articleInfo',{
        title:'文章详情',
        user:req.session.suer
    })
});

//搜索文章
router.get('/searchArticle',(req,res,next) => {
    Db.searchArticle(Article,req.body.search,(err,articles) => {
        if(err) {
            return res.end(err);
        }
        res.json({success:'success',articles:articles});
    });
    res.end('success');
});




//用户上传头像
router.get('/uploadLogo',isLogined,(req,res,next) => {
    res.render('web/uploadLogo');
});
//用户头像上传
router.post('/uploadLogo',upload.single('logo'),(req,res,next) => {
    let src = 'public/upload/users/logos/small/' + req.file.filename;
    gm(req.file.destination + req.file.filename)
        .resize(200,200,'!')
        .write(src,err => {
            if(err) {
                console.log(err);
            }
            Db.uploadLogo(User,Article,Comment,req,(err,user) => {
                if(err) {
                    return res.end(err);
                }
                req.session.user = user;
                res.redirect('/users?username=' + req.session.user.username);
            });
        });

    /*gm(req.file.destination + req.file.filename)
        /!*.resize(100,100,'!')
        .noProfile()*!/
        .flip()
        .magnify()
        // .rotate('green', 45)
        // .blur(7, 3)
        .crop(300, 300, 0, 400)
        // .edge(3)
        .write('public/upload/users/logos/small/' + req.file.filename,function (err,file) {
            if(err) console.log(err);
            console.log(file);
        });
    res.redirect('/users?username=' + req.session.user.username);*/
    // res.json({success:'success',url:req.file.destination + req.file.filename});

});

//新增一款皮肤
router.get('/addSkin',(req,res,next) => {
    res.render('web/addSkin');
});
//新增一款皮肤
router.post('/addSkin',(req,res,next) => {
    Db.addSkin(Skin,req,(err,skin) => {
        if(err) {
            return res.end(err);
        }
        res.json(skin);
    });
});
//获取皮肤
router.get('/getSkin',(req,res,next) => {
    if(req.query.skin_id) {
        Db.findSkinById(Skin,req.query.skin_id,(err,skin) => {
            if(err) {
                return res.end(err);
            }
            res.json({success:'success',skin:skin});
        })
    }else {
        Db.findSkins(Skin,(err,skins) => {
            if(err) {
                return res.end(err);
            }
            res.json({success:'success',skins:skins});
        })
    }
});
//修改用户的皮肤信息
router.post('/editUserSkin',(req,res,next) => {
    Db.editUserSkin(User,req,(err,user) => {
        if(err) {
            return res.end(err);
        }
        req.session.user = user;
        res.json({success:'success',user:user});
    })
});

module.exports = router;