const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//新增的功能
const session = require('express-session');
//使用redis
// var RedisStore = require('connect-redis')(session);
//使用connect-mongo
const MongoStore = require('connect-mongo')(session);
const io = require('socket.io')();
const fs = require('fs');

const moment = require('moment');
const partials = require('express-partials');
//系统功能支持
// var system = require('./routes/system.js');
//站点的配置
const settings = require('./models/db/settings.js');
//路由的加载
const index = require('./routes/index');
const users = require('./routes/users')(io);//用户登录注册需要io
//位置很重要，将filter放在路由后面
// var filter = require('./util/filter.js');
const app = express();

//设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

// app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置session
/*app.use(session({
  secret:settings.session_secret,
    key:settings.auth_cookie_name,
  store:new RedisStore({
    port:settings.redis_port,
    host:settings.redis_host,
    pass:settings.redis_psd,
    ttl:1800 //过期时间
  }),
  resave:true,
  saveUninitialized:true
}));*/

//设置session存储数据库
app.use(session({
  secret:settings.session_secret,
    key:settings.auth_cookie_name,
    store:new MongoStore({
      url:settings.URL
    }),
    resave:false,
    saveUninitialized:true
}));

// app.use(filter.authUser);

//时间监听
app.io = io;
io.on('connection',(socket) => {
  //socket.emit('news',{hello:'world};
  // socket.on('my other event',function (data) {
  //   console.log(data);
  // });
});
//数据格式化
app.locals.myDateFormat = (date) => {
  moment.locale('zh-cn');
  return moment(date).startOf('hour').fromNow();
};
app.locals.searchKeyword = (content,key) => {
  let newContent = content;
  if(newContent && key) {
    let keyword = key.replace(/(^\s*)|(\s*$)/g,"");
    if(keyword != '') {
      let reg = new RegExp(keyword,'gi');
      newContent = content.replace(reg,'<span style="color:red">' + key + '</span>');
    }
  }
  return newContent;
};

//首页路由
app.use('/', index);
//登录注册的路由
app.use('/users', users);
//系统需要的功能
// app.use('/system',system);

//捕获错误信息，进行处理
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 错误处理
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //返回错误页面
  res.status(err.status || 500);
  res.render('error',{
      error:err
  })
});

app.listen(4040,() => {
  console.log('node is OK');
});

module.exports = app;
