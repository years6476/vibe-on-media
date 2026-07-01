/**
 * src/lib/db/adapter.ts
 *
 * এখন: "firebase"
 * VPS নিলে: এখানে "api" করবেন — শুধু এই এক লাইন।
 */
export const DB_ADAPTER = "firebase" as "firebase" | "api";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
