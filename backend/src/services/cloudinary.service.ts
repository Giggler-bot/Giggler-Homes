import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.js";



export function uploadMedia(
  file: Buffer,
  folder: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if(error) {
          console.error("Cloudinary raw upload error: ", error);
          return reject(error);
        }

        if(!result) {
          return reject(new Error("cloudinary upload failed"));
        }

        resolve(result);
      },
    );

    uploadStream.end(file);
  });
}

export async function deleteMediaAsset(
  publicId: string,
  resourceType: "image" | "video",
) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  })
}