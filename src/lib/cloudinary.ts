import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { ClassMediaType } from "@prisma/client";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing`);
  }
  return value;
}

let configured = false;

function ensureCloudinaryConfig() {
  if (configured) {
    return;
  }

  cloudinary.config({
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  configured = true;
}

export type UploadedClassAsset = {
  mediaType: ClassMediaType;
  secureUrl: string;
  publicId: string;
  originalName?: string;
};

function mediaTypeFromResourceType(resourceType?: string): ClassMediaType {
  if (resourceType === "video") {
    return ClassMediaType.VIDEO;
  }
  return ClassMediaType.IMAGE;
}

export async function uploadClassAsset(file: File): Promise<UploadedClassAsset> {
  ensureCloudinaryConfig();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nextgenict/classes",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          mediaType: mediaTypeFromResourceType(result.resource_type),
          secureUrl: result.secure_url,
          publicId: result.public_id,
          originalName: result.original_filename,
        });
      },
    );

    stream.end(buffer);
  });
}
