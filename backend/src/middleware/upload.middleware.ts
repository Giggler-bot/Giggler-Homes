import multer from "multer";
import { AppError } from "../common/errors/AppError.js";

const storage = multer.memoryStorage();

const allowedMediaTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime"

]


export const uploadMediaFile = multer({
    storage,

    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
    },

    fileFilter: (_req, file, callback) => {
        if(!allowedMediaTypes.includes(file.mimetype)) {
            return callback(
                new AppError("Unsupported media file type", 400),
            )
        }

        callback(null, true);
    },


});