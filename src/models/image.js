import mongoose from "mongoose";

let Schema = mongoose.Schema;

let image = new Schema({
    contentType: {type: String, required: true},
    data: {
        type: Buffer,
        validate: {validator: validateImage, message: "Image is too Large."},
        required: true
    }
});

function validateImage(image) {
    return image.length <= (2 * 1024 * 1024);
}

mongoose.model('Image', image);

export default image;