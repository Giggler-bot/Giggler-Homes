import type { UploadApiResponse } from "cloudinary";
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
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload returned no result"));
        }

        resolve(result);
      },
    );

    uploadStream.on("error", reject);
    uploadStream.end(file);
  });
}

export async function deleteMediaAsset(
  publicId: string,
  resourceType: "image" | "video",
) {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Failed to delete Cloudinary asset");
  }

  return result;
}