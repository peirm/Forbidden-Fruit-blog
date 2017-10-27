const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
const moment = require('moment');

const SkinSchema = new Schema ({
    _id:{
        type:String,
        unique:true,
        default:shortid.generate
    },
    bodyBg:String,
    userBg:String,
    mainBgc:String
});

const Skin = mongoose.model('Skin',SkinSchema);
module.exports = Skin;