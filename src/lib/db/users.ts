/**
 * src/lib/db/users.ts
 *
 * ─── Firebase Realtime Database structure ────────────────────────────────────
 *
 * এই exact structure এ Firebase এ data সেভ হবে।
 * VPS নিলে এই JSON structure হুবহু MongoDB / PostgreSQL এ import হবে।
 * uid গুলো primary key হিসেবে কাজ করে — তাই কোনো reference ভাঙবে না।
 *
 * users/
 *   {uid}/
 *     uid            : string        ← Firebase Auth UID (primary key)
 *     firstName      : string
 *     middleName     : string        ← "" যদি না দেয়
 *     lastName       : string
 *     displayName    : string        ← firstName + middleName + lastName
 *     email          : string
 *     username       : string        ← lowercase, unique
 *     dateOfBirth    : string        ← "YYYY-MM-DD"
 *     gender         : string        ← "male" | "female" | "other" | "prefer_not_to_say"
 *     createdAt      : string        ← ISO 8601 (2025-01-15T10:30:00.000Z)
 *     avatarUrl      : string | null ← Cloudinary URL
 *     bio            : string        ← ""
 *     followers      : number        ← 0
 *     following      : number        ← 0
 *
 * usernames/
 *   {username}       : string (uid)  ← unique lookup index
 *                                       VPS এ এটা users table এর unique index হবে
 *
 * ─── Export করার নিয়ম (VPS নেওয়ার সময়) ─────────────────────────────────────
 *
 * Firebase Realtime DB:
 *   Firebase Console → Realtime Database → ⋮ → Export JSON
 *   "users" object → MongoDB "users" collection এ import
 *   "usernames" object → index হিসেবে রাখো
 *
 * Firebase Auth (user list):
 *   Terminal: firebase auth:export users_auth.json --format=json
 *   uid + email mapping টা নিজের auth system এ রাখো
 *
 * Cloudinary (media files):
 *   Cloudinary Console → Media Library → Download All
 *   অথবা Cloudinary API দিয়ে batch download
 *   প্রতিটা file এর public_id = uid/filename format এ রাখা আছে
 *   নিজের storage এ একই folder structure এ রাখো → avatarUrl গুলো শুধু domain বদলাবে
 */

import { DB_ADAPTER } from "./adapter";
import { app } from "@/lib/firebase/config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewUser = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  username: string;
};

export type UserProfile = {
  uid: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  email: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  createdAt: string;
  avatarUrl: string | null;
  bio: string;
  followers: number;
  following: number;
};

// ─── Firebase ─────────────────────────────────────────────────────────────────

const firebase = {
  async isUsernameTaken(username: string): Promise<boolean> {
    const { getDatabase, ref, get } = await import("firebase/database");
    const db = getDatabase(app);
    const snap = await get(ref(db, `usernames/${username}`));
    return snap.exists();
  },

  async createUser(data: NewUser): Promise<UserProfile> {
    const { getAuth, createUserWithEmailAndPassword, updateProfile } =
      await import("firebase/auth");
    const { getDatabase, ref, set } = await import("firebase/database");

    const auth = getAuth(app);
    const db = getDatabase(app);

    const credential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const { uid } = credential.user;

    const displayName = [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(" ");

    await updateProfile(credential.user, { displayName });

    const profile: UserProfile = {
      uid,
      firstName: data.firstName,
      middleName: data.middleName ?? "",
      lastName: data.lastName,
      displayName,
      email: data.email,
      username: data.username,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      createdAt: new Date().toISOString(),
      avatarUrl: null,
      bio: "",
      followers: 0,
      following: 0,
    };

    // users/{uid} — main profile
    await set(ref(db, `users/${uid}`), profile);

    // usernames/{username} → uid — unique index
    await set(ref(db, `usernames/${data.username}`), uid);

    return profile;
  },

  async getUserById(uid: string): Promise<UserProfile | null> {
    const { getDatabase, ref, get } = await import("firebase/database");
    const db = getDatabase(app);
    const snap = await get(ref(db, `users/${uid}`));
    return snap.exists() ? (snap.val() as UserProfile) : null;
  },

  async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const { getDatabase, ref, update } = await import("firebase/database");
    const db = getDatabase(app);
    await update(ref(db, `users/${uid}`), updates);
  },
};

// ─── VPS placeholder (VPS নেওয়ার সময় এখানে কাজ করবো) ──────────────────────

const api = {
  isUsernameTaken: (_username: string): Promise<boolean> => {
    throw new Error("VPS adapter not implemented yet");
  },
  createUser: (_data: NewUser): Promise<UserProfile> => {
    throw new Error("VPS adapter not implemented yet");
  },
  getUserById: (_uid: string): Promise<UserProfile | null> => {
    throw new Error("VPS adapter not implemented yet");
  },
  updateUser: (_uid: string, _updates: Partial<UserProfile>): Promise<void> => {
    throw new Error("VPS adapter not implemented yet");
  },
};

// ─── Exports ──────────────────────────────────────────────────────────────────

const impl = DB_ADAPTER === "firebase" ? firebase : api;

export const isUsernameTaken = (username: string) => impl.isUsernameTaken(username);
export const createUser      = (data: NewUser)     => impl.createUser(data);
export const getUserById     = (uid: string)        => impl.getUserById(uid);
export const updateUser      = (uid: string, updates: Partial<UserProfile>) =>
  impl.updateUser(uid, updates);
