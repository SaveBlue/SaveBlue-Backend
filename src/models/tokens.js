import mongoose from 'mongoose';
let Schema = mongoose.Schema;

const token = new Schema({
        token: {type: String, required: true},
        date: {type: Date, default: Date.now},
    },
    {
        timestamps: true
    });

mongoose.model('Token', token);
