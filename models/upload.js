const fs = require('fs')
const gm = require('gm');

//引入上传文件模块
const multer = require('multer');

//定义一个路径过滤函数
function formatMime(req,file,cb) {
    let name = req.session.user.username;
    switch (file.mimetype) {
        case 'image/jpeg':
            name += '.jpg';
            break;
        case 'image/png':
            name += '.png';
            break;
        case 'image/gif':
            name += '.gif';
            break;
        default:
            cb('不支持此类文件');
            break;
    }
    return name;
}

const storage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null,'public/upload/users/logos/big/')
    },
    filename:(req,file,cb) => {
        let name = formatMime(req,file,cb);
        cb(null,name);
    }
});
const upload = multer({storage:storage});
module.exports = upload;