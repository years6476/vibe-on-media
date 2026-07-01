/**
 * src/lib/db/media.ts
 *
 * ─── Cloudinary folder structure ─────────────────────────────────────────────
 *
 * প্রতিটা user এর media আলাদা folder এ রাখা হয়।
 * এই structure টা VPS এ migrate করতে হলে হুবহু same রাখলেই হবে,
 * শুধু domain বদলাবে (res.cloudinary.com → আপনার storage URL)।
 *
 * vibeon/
 *   users/
 *     {uid}/
 *       avatar/
 *         profile          ← profile picture (একটাই থাকবে, overwrite হবে)
 *       posts/
 *         {postId}         ← post image/video
 *       stories/
 *         {storyId}        ← story media
 *
 * public_id format: "vibeon/users/{uid}/avatar/profile"
 *                   "vibeon/users/{uid}/posts/{postId}"
 *
 * ─── Export করার নিয়ম (VPS নেওয়ার সময়) ─────────────────────────────────────
 *
 * Cloudinary API দিয়ে সব resource list করো:
 *   GET https://api.cloudinary.com/v1_1/{cloud_name}/resources/image
 *   GET https://api.cloudinary.com/v1_1/{cloud_name}/resources/video
 *
 * public_id থেকে uid আর file type বের করো (folder structure দেখে)।
 * Download করে নিজের storage এ same folder structure এ রাখো।
 * Firebase DB তে avatarUrl গুলো নতুন domain দিয়ে update করো।
 */

import { DB_ADAPTER } from "./adapter";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadResult = {
  url: string;       // full CDN URL
  publicId: string;  // Cloudinary public_id (storage তে path)
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

// ─── Cloudinary upload helper ─────────────────────────────────────────────────

const CLOUD_NAME  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

/**
 * Avatar আপলোড করো।
 * public_id: "vibeon/users/{uid}/avatar/profile"
 * একই public_id ব্যবহার করায় পুরনো avatar overwrite হয়।
 */
export async function uploadAvatar(
  uid: string,
  file: File
): Promise<UploadResult> {
  if (DB_ADAPTER !== "firebase") {
    throw new Error("Media upload: VPS adapter not implemented yet");
  }

  const publicId = `vibeon/users/${uid}/avatar/profile`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Avatar upload failed");

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

/**
 * Post media আপলোড করো (image বা video)।
 * public_id: "vibeon/users/{uid}/posts/{postId}"
 */
export async function uploadPostMedia(
  uid: string,
  postId: string,
  file: File
): Promise<UploadResult> {
  if (DB_ADAPTER !== "firebase") {
    throw new Error("Media upload: VPS adapter not implemented yet");
  }

  const isVideo = file.type.startsWith("video/");
  const publicId = `vibeon/users/${uid}/posts/${postId}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("public_id", publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo ? "video" : "image"}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Post media upload failed");

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}
