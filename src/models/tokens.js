const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const token = new Schema({
    token: {type: String, required: true},
    date: {type: Date, default: Date.now},
});

mongoose.model('Token', token);
