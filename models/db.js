//所有的数据库操作公共方法都放在这儿
//引入url模块
const url = require('url');
//引入加密模块
const crypto = require('crypto');
//引入short-id模块
const shortid = require('shortid');
//引入数据库配置文件
// const mongoose = require('mongoose');
// const settings = require('./db/settings');
//引入mongoose配置文件
//连接数据库开始
// const db = mongoose.connect(settings.URL);
//mongoose.connect('mongodb://localhost/27017')
//时间格式化
//文档格式化
const markdown = require('markdown').markdown;

const DbSet = {
    del:(obj,req,res,logMsg) => {
        let params = url.parse(req.url,true);
        let targetId = params.query.uid;
        if(shortid.isValid(targetId)) {
            obj.remove({_id:targetId},(err,result) => {
                if(err) {
                    res.end(err);
                }else {
                    console.log(logMsg + 'success');
                    res.end('success');
                }
            })
        }else {
            res.end('非法参数');
        }
    },
    //通用的查询所有的操作
    finaAll:(obj,req,res,logMsg) => {
        obj.find({},function (error,result) {
            if(err) {
                res.next(err);
            }else {
                console.log(logMsg + 'success');
                return res.json(result);
            }
        })
    },
    //通用的查询一条数据的操作
    findOne:(obj,req,res,logMsg) => {
        let params = url.parse(req.url,true);
        let targetId = params.query.uid;
        if(shortid.isValid(targetId)) {
            obj.findOne({_id:targetId},function (err,result) {
                if(err) {
                    res.next(err);
                }else {
                    console.log(logMsg + 'success');
                    return res.json(result);
                }
            })
        }
    },
    //通用的更新一条数据的操作
    updateOneById:(obj,req,res,logMsg) => {
        let params = url.parse(req.url,true);
        let targetId = params.query.uid;
        if(shortid.isValid(targetId)) {
            let conditions = {_id:targetId};
            req.body.updateDate = new Date();
            let update = {$set:req.body};
            obj.update(conditions,update,(err,result) => {
                if(err) {
                    res.rend(err);
                }else {
                    console.log(logMsg + 'success');
                    res.end('success');
                }
            })
        }
    },
    //通用的新增一条数据的操作
    addOne:(obj,req,res) => {
        let newObj = new obj(req.body);
        newObj.save(err => {
            if(err) {
                res.end(err);
            }else {
                res.end('success');
            }
        })
    },

    //下面是定义的一些方法

    //新增一篇说说
    addOneTalking:(Article,User,req,res) => {
        //实例化一个实体
        let article = new Article({
            keywords:'说说',
            content:req.body.talking,
            author:req.session.user.username,
            authorLogo:req.session.user.logo
        });
        if(req.body.state === 'false') {
            article.state = false;
        }
        article.save((err,article) => {
            if(err) {
                return res.end(err);
            }
            User.findByIdAndUpdate(req.session.user._id,{$inc:{articlesNum:1},$push:{articlesIds:article._id}},err => {
                if(err) {
                    return res.end(err);
                }
                User.findById(req.session.user._id,(err,user) => {
                    if(err) {
                        return res.end(err);
                    }
                    req.session.user = user;
                    res.end('success')
                })
            })
        })
    },
    //新增一片日志
    addOneDiary:(Article,User,req,res) => {
        let article = new Article({
            keywords:'日志',
            title:req.body.title,
            type:'日志',
            tags:JSON.parse(req.body.tags),
            content:req.body.content,
            author:req.session.user.username,
            authorLogo:req.session.user.logo
        });
        if(req.body.state === 'false') {
            article.state = false;
        }
        article.save((err,article) => {
            if(err) {
                return res.end(err);
            }
            User.findByIdAndUpdate(req.session.user._id,{$inc:{articlesNum:1},$push:{articlesIds:article._id}},err => {
                if(err) {
                    return res.end(err);
                }
                User.findById(req.session.user._id,(err,user) => {
                    if(err) {
                        return res.end(err);
                    }
                    req.session.user = user;
                    res.end('success')
                })
            })
        })
    },
    //删除一篇文章或者说说
    deleteArticle:(Article,User,Comment,article_id,user_id,callback) => {
      Article.findByIdAndRemove(article_id,err => {
          if(err) {
              return callback(err);
          }
          Comment.remove({articleId:article_id},err => {
              if(err) {
                  return callback(err);
              }
              User.findByIdAndUpdate(user_id,{$pull:{articlesIds:article_id},$inc:{articlesNum:-1}},err => {
                  if(err) {
                      return callback(err);
                  }
                  User.update({collectArticlesIds:article_id},{$pull:{collectArticlesIds:article_id},$inc:{collectArticlesNum:-1}},err => {
                      if(err) {
                          return callback(err);
                      }
                      User.update({copyArticlesIds:article_id},{$pull:{copyArticlesIds:article_id},$inc:{copyArticlesNum:-1}},(err,state) => {
                          if(err) {
                              return callback(err);
                          }
                          return callback(null,state);
                      })
                  })
              })
          })
      })  
    },
    //查找一篇文章
    findArticleById:(Article,article_id,callback) => {
      Article.findById(article_id,(err,article) => {
          if(err) {
              return callback(err);
          }
          callback(null,article);
      })
    },
    //保存修改文章
    saveEditArticle:(Article,content,callback) => {
        Article.findByIdAndUpdate(content._id,{title:content.title,content:content.content,state:content.state,updateDate:Date.now()},err => {
            if(err) {
                return callback(err);
            }
            Article.findById(content._id,(err,article) => {
                if(err) {
                    return callback(err);
                }
                return callback(null,article);
            })
        })
    },
    //条件查找文章
    findArticlesByConditions:(Article,conditions,callback) => {
        if(!conditions) {
            conditions = {};
        }
        Article.find(conditions).sort({updateDate:-1}).exec((err,results) => {
            if(err) {
                return callback(err);
            }
            results.forEach(result => {
                result.content = markdown.toHTML(result.content);
            });
            callback(null,results);
        })
    },
    //获取所有的标签
    getAllTags:(Article,callback) => {
        Article.find({},{tags:1}).sort({updateDate:-1}).exec((err,allTags) => {
            if(err){
                return callback(err);
            }
            return callback(null,allTags);
        })
    },
    //获取最近文章
    getRecentArticles:(Article,callback) => {
        Article.find({},{author:1,title:1,content:1,type:1}).limit(10).sort({updateDate:-1}).exec((err,articles) => {
            if(err) {
                return callback(err);
            }
            return callback(null,articles);
        })
    },
    //记录文章阅读量
    viewArticle:(Article,article_id,callback) => {
        Article.findByIdAndUpdate(article_id,{$inc:{clickNum:1}},err => {
            if(err) {
                return callback(err);
            }
            Article.findById(article_id,(err,article) => {
                if(err) {
                    return callback(err);
                }
                article.content = markdown.toHTML(article.content);
                return callback(null,article);
            })
        })
    },
    //收藏一片文章
    collectArticle:(Article,User,article_id,user_id,callback) => {
        Article.findByIdAndUpdate(article_id,{$inc:{collectNum:1},$push:{collectUserIds:user_id}},err => {
            if(err) {
                return callback(err);
            }
            User.findByIdAndUpdate(user_id,{$inc:{collectArticlesNum:1},$push:{collectArticlesIds:article_id}},err => {
                if(err) {
                    return callback(err);
                }
                User.findById(user_id,(err,user) => {
                    if(err) {
                        return callback(err);
                    }
                    Article.findById(article_id,(err,article) => {
                        if(err) {
                            return callback(err);
                        }
                        return callback(null,user,article);
                    })
                })
            })
        })
    },
    //转发一篇文章
    copyArticle:(Article,User,article_id,user_id,callback) => {
      Article.findByIdAndUpdate(article_id,{$inc:{copyNum:1}},err => {
          if(err) {
              return callback(err);
          }
          User.findByIdAndUpdate(user_id,{$inc:{copyArticlesNum:1},$push:{copyArticlesIds:article_id}},err => {
              if(err) {
                  return callback(err);
              }
              User.findById(user_id,(err,user) => {
                  if(err) {
                      return callback(err);
                  }
                  Article.findById(article_id,(err,article) => {
                      if(err) {
                          return callback(err);
                      }
                      return callback(null,user,article);
                  })
              })
          })
      })
    },
    //文章点赞
    likeArticle:(Article,article_id,user_id,callback) => {
        Article.findByIdAndUpdate(article_id,{$inc:{likeNum:1},$push:{likeUserIds:user_id}},err => {
            if(err) {
                return callback(err);
            }
            Article.findById(article_id,(err,article) => {
                if(err) {
                    return callback(err);
                }
                return callback(null,article);
            })
        })
    },
    //取消文章点赞
    unlikeArticle:(Article,article_id,user_id,callback) => {
        Article.findByIdAndUpdate(article_id,{$inc:{likeNum:-1},$pull:{likeUserIds:user_id}},err => {
            if(err) {
                return callback(err);
            }
            Article.findById(article_id,(err,article) => {
                if(err) {
                    return callback(err);
                }
                return callback(null,article);
            })
        })
    },
    //发表文章评论
    commentArticle:(Article,User,Comment,article_id,user,comment,callback) => {
        let commentEntity = new Comment({
            commenterId:user._id,
            commenter:user.username,
            commenterLogo:user.logo,
            comment:comment,
            articleId:article_id
        });
        commentEntity.save((err,comment) => {
            if(err) {
                return callback(err);
            }
            Article.findByIdAndUpdate(article_id,{$inc:{commentNum:1},$push:{commentsIds:comment._id}},err => {
                if(err) {
                    return callback(err);
                }
                Article.findById(article_id,(err,article) => {
                    if(err) {
                        return callback(err);
                    }
                    article.content = markdown.toHTML(article.content);
                    Comment.find({articleId:article_id}).sort({commentTime:-1}).exec((err,comments) => {
                        if(err) {
                            return callback(err);
                        }
                        comments.forEach(comment => {
                            comment.comment = markdown.toHTML(comment.comment);
                        });
                        return callback(null,article,comments);
                    })
                })
            })
        });

    },
    //模糊搜索文章
    searchArticle:(Article,search,callback) => {
        Article.find({$or:[{author:{$regex:new RegExp(search)}},{title:{$regex:new RegExp(search)}},{tags:{$regex:new RegExp(search)}}]},(err,articles) => {
            if(err) {
                return callback(err);
            }
            console.log(articles);
            return callback(null,articles);
        })
    },

    //对评论表进行的操作
    findCommentsByConditions:(Comment,conditions,callback) => {
      Comment.find(conditions).sort({commentTime:-1}).exec((err,comments) => {
          if(err) {
              return callback(err);
          }
          comments.forEach(comment => {
              comment.comment = markdown.toHTML(comment.comment);
          });
          return callback(null,comments);
      })
    },

    //对用户表进行的操作

    //根据条件查找一条用户信息
    findOneUser:(User,_id,callback) => {
        User.findById(_id,function (err,user) {
            if(err) {
                return callback(err);
            }
            return callback(null,user);
        })
    },
    //用户上传头像
    uploadLogo:(User,Article,Comment,req,callback) => {
        var src = '/upload/users/logos/small/' + req.file.filename;
        User.findByIdAndUpdate(req.session.user._id,{logo:src},err => {
            if(err) {
                return callback(err);
            }
            Article.update({author:req.session.user.username},{authorLogo:src},{multi:true},err => {
                if(err) {
                    return callback(err);
                }
                Comment.update({commenter:req.session.user.username},{commenterLogo:src},{multi:true},err => {
                    if(err) {
                        return callbackk(err);
                    }
                    User.findById(req.session.user._id,(err,user) => {
                        if(err) {
                            return callback(err);
                        }
                        return callback(null,user);
                    })
                })
            })
        })
    },
    //修改用户的皮肤
    editUserSkin:(User,req,callback) => {
        User.findByIdAndUpdate(req.session.user._id,{skinId:req.body._id,'userSkin.bodyBg':req.body.bodyBg,'userSkin.userBg':req.body.userBg,'userSkin.mainBgc':req.body.mainBgc},err => {
            if(err) {
                return callback(err);
            }
            User.findById(req.session.user._id,(err,user) => {
                if(err) {
                    return callback(err);
                }
                return callback(null,user);
            });
        })
    },
    //分页
    //密码加密
    encrypt:(data,key) => {
        let cipher = crypto.createCipher('bf',key);
        let newPsd = '';
        newPsd += cipher.update(data,'utf8','hex');
        newPsd += cipher.final('hex');
        return newPsd;
    },
    //密码解密
    decrypt:(data,key) => {
        let decipher = crypto.createDecipher('bf',key);
        let oldPsd = '';
        oldPsd += decipher.update(data,'hex','utf8');
        oldPsd += decipher.final('utf8');
        return oldPsd;
    },


    //皮肤页面操作
    //新增一款皮肤
    addSkin:(Skin,req,callback) => {
        let skinEntity = new Skin({
            bodyBg:req.body.bodyBg,
            userBg:req.body.userBg,
            mainBgc:req.body.mainBgc
        });
        skinEntity.save((err,skin) => {
            if(err) {
                return callback(err);
            }
            return callback(null,skin);
        })
    },
    //查找一款皮肤
    findSkinById:(Skin,skin_id,callback) => {
        Skin.findById(skin_id,(err,skin) => {
            if(err) {
                return callback(err);
            }
            return callback(null,skin);
        })
    },
    //查找所有的皮肤
    findSkins:(Skin,callback) => {
        Skin.find({},function (err,skins) {
            if(err) {
                return callback(err);
            }
            return callback(null,skins);
        })
    }
};
module.exports = DbSet;