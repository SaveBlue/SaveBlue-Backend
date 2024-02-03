/*import multer from 'multer';

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extension = filetypes.test((file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extension) {
        cb(null, true);
    } else {
        cb("Only jpg and png images allowed.", false);
    }
};

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: multerFilter
});

const uploadFile = upload.single("image")

export const uploadImageMemory = (req, res, next) => {
    uploadFile(req, res, error => {

        // Multer error
        if (error instanceof multer.MulterError) {
            console.log(error.message )
            return res.status(400).send({
                message: error.message || "Multer error."
            });
        }
        else if (error) {
            return res.status(400).send({
                message: error.message || "An error occurred while uploading image!"
            });
        }
        next();
    });
};*/

import {fileTypeFromBuffer} from 'file-type';

function isValidFileType(type) {
    // Check if the detected file type is among the allowed types
    return ['image/jpeg', 'image/png'].includes(type.mime);
}

const MAX_SIZE = 2 * 1024 * 1024;

function isValidSize(buffer) {
    return buffer.length <= MAX_SIZE;
}

export const checkImageValidity = async (req, res, next) => {

    if(!req.body.image) {
       return next();
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