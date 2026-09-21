import fs from "node:fs";
import path from "node:path";
import {
  uploadMedia,
  deleteMediaAsset,
} from "../src/services/cloudinary.service.js";

async function testCloudinaryUpload() {
  try {
    console.log("Testing uploadMedia()...");

    const filePath = path.resolve("kkakak.jpg");
    const fileBuffer = fs.readFileSync(filePath);

    const result = await uploadMedia(
      fileBuffer,
      "giggler-homes/test",
    );

    console.log("========== UPLOAD SUCCESS ==========");
    console.log({
      asset_id: result.asset_id,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      secure_url: result.secure_url,
    });

    console.log("\nTesting deleteMediaAsset()...");

    const deleteResult = await deleteMediaAsset(
      result.public_id,
      result.resource_type === "video"
        ? "video"
        : "image",
    );

    console.log("========== DELETE RESULT ==========");
    console.log(deleteResult);
  } catch (error) {
    console.error("========== TEST FAILED ==========");
    console.error(error);
  }
}

testCloudinaryUpload();