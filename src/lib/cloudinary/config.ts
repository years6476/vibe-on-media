// Cloudinary এর ৪টা একাউন্ট — প্রতিটায় ফ্রি 25GB
// round-robin ভাবে একাউন্ট বাছাই হবে, যাতে সব একাউন্টে সমান লোড পড়ে

export const CLOUDINARY_ACCOUNTS = [
  {
    id: 1,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_1!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_1!,
  },
  {
    id: 2,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_2!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_2!,
  },
  {
    id: 3,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_3!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_3!,
  },
  {
    id: 4,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_4!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_4!,
  },
] as const;

// বর্তমানে কোন একাউন্টের পালা সেটা Firestore এর "system_state" doc এ ট্র্যাক করা হবে
// আপাতত random select — পরে round-robin এ আপগ্রেড করা যাবে
export function getCloudinaryAccount(accountId?: 1 | 2 | 3 | 4) {
  if (accountId) {
    return CLOUDINARY_ACCOUNTS.find((acc) => acc.id === accountId)!;
  }
  const randomIndex = Math.floor(Math.random() * CLOUDINARY_ACCOUNTS.length);
  return CLOUDINARY_ACCOUNTS[randomIndex];
}
