import {fileTypeFromBuffer} from 'file-type';

function isValidFileType(type) {
    // Check if the detected file type is among the allowed types
    return ['image/jpeg', 'image/png', 'application/pdf'].includes(type?.mime);
}

const MAX_SIZE = 2 * 1024 * 1024;

function isValidSize(buffer) {
    return buffer.length <= MAX_SIZE;
}

const checkFileValidity = async (req, res, next) => {

    if(!req.body.file) {
       return next();
    }

    if (typeof req.body.file !== 'string') {
        return res.status(400).send({
            message: "Invalid file format."
        });
    }

    const fileBuffer = Buffer.from(req.body.file, 'base64');

    if (!isValidSize(fileBuffer)) {
        return res.status(400).send({
            message: "File is too large."
        });
    }

    const fileType = await fileTypeFromBuffer(fileBuffer)
    console.log("fileType", fileType)
    if (!isValidFileType(fileType)) {
        return res.status(400).send({
            message: "Invalid file type."
        });
    }

    // if everything is valid, convert the file to a buffer and update the request body
    req.body.file = {
        contentType: fileType.mime,
        data: fileBuffer
    }

    next();
}

export default {checkFileValidity};