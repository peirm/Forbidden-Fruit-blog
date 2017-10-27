/**
 * Created by june on 2017/1/5.
 */
const mongoose = require('mongoose');
const settings = require('./db/settings.js');
const db = mongoose.connect(settings.URL);