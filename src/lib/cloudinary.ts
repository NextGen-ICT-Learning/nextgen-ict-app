import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { ClassMediaType, ClassPostMediaType } from "@prisma/client";

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

export type UploadedPostAsset = {
  mediaType: ClassPostMediaType;
  secureUrl: string;
  publicId: string;
  originalName?: string;
};

function classMediaTypeFromFile(file: File): ClassMediaType {
  if (file.type.startsWith("video/")) {
    return ClassMediaType.VIDEO;
  }
  if (file.type === "application/pdf") {
    return ClassMediaType.PDF;
  }
  return ClassMediaType.IMAGE;
}

function postMediaTypeFromFile(file: File): ClassPostMediaType {
  if (file.type.startsWith("image/")) {
    return ClassPostMediaType.IMAGE;
  }
  if (file.type.startsWith("video/")) {
    return ClassPostMediaType.VIDEO;
  }
  if (file.type === "application/pdf") {
    return ClassPostMediaType.PDF;
  }
  return ClassPostMediaType.FILE;
}

async function uploadToCloudinary(file: File, folder: string) {
  ensureCloudinaryConfig();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{
    resourceType: string;
    secureUrl: string;
    publicId: string;
    originalName?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
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
          resourceType: result.resource_type,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          originalName: result.original_filename,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function uploadClassAsset(file: File): Promise<UploadedClassAsset> {
  const uploaded = await uploadToCloudinary(file, "nextgenict/classes");

  return {
    mediaType: classMediaTypeFromFile(file),
    secureUrl: uploaded.secureUrl,
    publicId: uploaded.publicId,
    originalName: uploaded.originalName,
  };
}

export async function uploadClassPostAsset(file: File): Promise<UploadedPostAsset> {
  const uploaded = await uploadToCloudinary(file, "nextgenict/class-posts");

  return {
    mediaType: postMediaTypeFromFile(file),
    secureUrl: uploaded.secureUrl,
    publicId: uploaded.publicId,
    originalName: uploaded.originalName,
  };
}
