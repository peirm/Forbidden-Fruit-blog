const mongoose = require('mongoose');
const settings = require('./db/settings.js');
const db = mongoose.connect(settings.URL);