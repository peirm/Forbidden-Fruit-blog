const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const settings = require('../models/db/settings.js');
const UserNotify = require('../models/UserNotify.js');
//用户实体类
const User = require('../models/User.js');

function gen_session(user,res) {
    let auth_token = user._id + '$$$$';//以后可能会存储更多信息，用$$$$来分割
    res.cookie(settings.auth_cookie_name,auth_token,
        {path:'/',maxAge:1000*60*60*24*30,signed:true,httpOnly:true});//cookie 有效期30天
}
exports.gen_session = gen_session;
exports.authUser = (req,res,next) => {
    if(settings.debug && req.cookies['mock_user']) {
        let mockUser = JSON.parse(req.cookies['mock_user']);
        req.session.user = new UserModel(mockUser);
        return next();
    }
    //如果是其他静态资源的请求，这里就不在生成user这个信息了
    if(req.session.user) {
        UserNotify.getNoReadNotifyCountByUserId(req.session.user._id,'user',(err,count) => {
            req.session.user.msg_coount = count;
            req.session.logined = true;
            return next();
        })
    }else {
        //第一次登陆的时候，根据cookie生成session
        //如果清楚了cookie，他是无法通过cookie生成session的
        let auth_token = req.signedCookies[settings.auth_cookie_name];
        if(!auth_token) {
            return next();
        }else {
            let auth = auth_token.split('$$$$');
            let user_id = auth[0];
            //根据cookie中的ID去user表中找用户信息
            User.findOne({'_id':user_id},(err,user) => {
                if(err) {
                    console.log(err);
                }else {
                    if(!user) {
                        return next();
                    }
                    UserNotify.getNoReadNotifyCountByUserId(user_id,'user',(err,count) => {
                        user.msg_count = count;
                        req.session.user = user;
                        req.session.logined = true;
                        return next();
                    })
                }
            })
        }
    }
};
