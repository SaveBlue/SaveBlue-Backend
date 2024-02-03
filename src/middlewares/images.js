import {fileTypeFromBuffer} from 'file-type';

function isValidFileType(type) {
    // Check if the detected file type is among the allowed types
    return ['image/jpeg', 'image/png'].includes(type?.mime);
}

const MAX_SIZE = 2 * 1024 * 1024;

function isValidSize(buffer) {
    return buffer.length <= MAX_SIZE;
}

const checkImageValidity = async (req, res, next) => {

    if(!req.body.image) {
       return next();
    }

    if (typeof req.body.image !== 'string') {
        return res.status(400).send({
            message: "Invalid image format."
        });
    }

    const imageBuffer = Buffer.from(req.body.image, 'base64');

    if (!isValidSize(imageBuffer)) {
        return res.status(400).send({
            message: "Image is too large."
        });
    }

    const fileType = await fileTypeFromBuffer(imageBuffer)
    if (!isValidFileType(fileType)) {
        return res.status(400).send({
            message: "Invalid file type."
        });
    }

    // if everything is valid, convert the image to a buffer and update the request body
    req.body.image= {
        contentType: fileType.mime,
        data: imageBuffer
    }

    next();
}

export default {checkImageValidity};