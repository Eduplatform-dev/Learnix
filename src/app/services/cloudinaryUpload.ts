export type UploadType = "video" | "pdf" | "image";

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  resourceType: string;
};

export async function uploadToCloudinary(
  file: File,
  type: UploadType
): Promise<CloudinaryUploadResult> {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;
  const FOLDER =
    (import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined) ||
    "edu-platform";

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `${FOLDER}/${type}`);

  const endpoint =
    type === "video"
      ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = await res.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
}
