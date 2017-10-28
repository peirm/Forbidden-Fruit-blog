const express = require('express');
const router = express.Router();
//加载依赖
const url = require('url');
//验证
const validator = require('validator');
//数据库操作类
const connect = require('../models/connect.js')
const User = require('../models/User.js');
const Article = require('../models/Article.js');
const Db = require('../models/db.js');
//加密类
const crypto = require('crypto');
//时间格式化
const moment = require('moment');
//站点的配置
const settings = require('../models/db/settings.js');
const shortid = require('shortid');
//系统相关操作
// const system = require('../util/system.js')
//数据校检
const filter = require('../util/filter.js')

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

/* GET users listing. */
const returnUserRouter = (io) => {
  //用户信息页面
  router.get('/',(req, res, next) => {
      if(!(req.query.username)) {
          req.query.username = req.session.user.username;
      }
      if(req.query.username) {
          User.findOne({username:req.query.username},(err,user) => {
              if(err) {
                  return res.end(err);
              }
              return res.render('web/user',{
                  title:req.query.username + '的个人中心',
                  user:req.session.user,
                  author:user
              })
          })
      }else {
          res.render('web/user',{
              title:req.session.user.username + '的个人中心',
              user:req.session.user,
              author:req.session.user
          })
      }
      // console.log(articles);
  });
  //用户注册页面
  router.get('/register',(req,res,next) => {
    res.render('web/userRegister',{
      title:'用户注册',
        user:req.session.user
    })
  });
    //用户注册
  router.post('/doRegister',(req,res,next) => {
    // console.log(req.body);
    let errors;
    let username = req.body.username;
    let password = req.body.password;
    let passwordRep = req.body.passwordRep;
    let email = req.body.email;
    if(!validator.matches(username,/^[a-zA-Z][a-zA-Z0-9_]{4,11}$/)) {
      errors = '用户名5-12个英文字母数字组合';
    }
    if(!validator.matches(password,/(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/) || !validator.isLength(password,6,12)){
      errors = "6-12位，只能包含字母、数字和下划线";
    }
    if(password !== passwordRep) {
      errors = '密码不匹配，请重新输入';
    }
    if(!validator.isEmail(email)) {
      errors = '请填写正确的邮箱地址';
    }
    if(errors) {
      res.end(errors);
    }else {
      let regMsg = {
        email:email,
        username:username
      };
      //邮箱和用户名都必须唯一
      let query = User.find().or([{'email':email},{'username':username}]);
      query.exec(function (err,user) {
        if(user.length > 0) {
          errors = '邮箱或用户名已存在';
          res.end(errors);
        }else {
          var newPsd = Db.encrypt(password,settings.encrypto_key);
          req.body.password = newPsd;
          //发送消息给管理员
          Db.addOne(User,req,res)
        }
      })
    }
  });
  //用户登录
  router.post('/doLogin',(req,res,next) => {
    let errors;
    let email = req.body.email;
    let password = req.body.password;
    let newPsd = Db.encrypt(password,settings.encrypto_key);
    if(!validator.isEmail(email)) {
        errors = '邮箱格式不正确';
    }
    if(!validator.matches(password,/(?!^\\d+$)(?!^[a-zA_Z]+$)(?!^[_#@]+$).{5,}/) || !validator.isLength(password,6,12)) {
      errors = '密码长度6-12个字符'
    }
    if(errors) {
      res.end(errors);
    }else {
      //成功之后
      User.findOne({email:email,password:newPsd},function (err,user) {
        if(user) {
          //将cookie存入缓存
          // filter.gen_session(user,res);
            req.session.user = user;
            // console.log(user._id)
            // console.log(req.session);
          res.end('success');
        }else {
          res.end('用户名或密码错误');
        }
      })
    }
  });
  //用户退出
  router.get('/logout',(req,res,next) => {
      req.session.destroy();
      res.end('success');
  });
  //获取已经登录的用户信息
  router.get('/getLoginedUser',(req,res,next) => {
     if(req.session.user) {
         // console.log(req.session.user._id);
        Db.findOneUser(User,req.session.user._id,(err,user) => {
            // console.log(user);
            if(err) {
                return res.end(err);
            }
            req.session.user = user;
            res.json({'success':'success','user':user});
        })
     }else {
        res.end('用户未登录');
     }
  });
    //用户信息界面
  router.get('/userInfo',(req,res,next) => {
      // Db.findOneUser(User,{_id:req.session.user._id},function (err,user) {
          res.render('web/editInfo',{
              title:'个人信息',
              user:req.session.user,
              author:req.session.user
          });
      // })
  });
    //用户信息
    router.get('/oneUser',(req,res,next) => {
        User.findById(req.session.user._id,(err,user) => {
            if(err) {
                return res.end(err);
            }
            res.json(user);
        })
    })
    //保存用户信息修改
    router.post('/editInfo',(req,res,next) => {
        console.log(req.body);
        User.findByIdAndUpdate(req.session.user._id,req.body,(err,user) => {
            if(err) {
                return res.end(err);
            }
            // console.log(user);
            res.end('success');
        })
    });
    //获取用户所有的文章
    router.get('/allArticles',(req,res,next) => {
        Db.findArticlesByConditions(Article,{author:req.query.username},(err,articles) => {
            if(err) {
                return res.end(err);
            }
            res.json(articles);
        })
    });
  return router
};

module.exports = returnUserRouter;