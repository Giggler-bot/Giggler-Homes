import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
]);

const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb,
) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        return cb(
            new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"),
        );
    }
    cb(null, true);
};

export const verificationUpload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1, // Limit to 1 file
    },
    fileFilter
});