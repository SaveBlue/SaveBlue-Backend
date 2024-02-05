import mongoose from "mongoose";

let Schema = mongoose.Schema;

let file = new Schema({
    contentType: {type: String, required: true},
    data: {
        type: Buffer,
        validate: {validator: validateFile, message: "File is too Large."},
        required: true
    }
});

function validateFile(file) {
    return file.length <= (2 * 1024 * 1024);
}

mongoose.model('File', file);

export default file;