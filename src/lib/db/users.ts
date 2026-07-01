/**
 * src/lib/db/users.ts
 *
 * ─── Firebase Realtime Database structure ────────────────────────────────────
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
 *     gender         : string
 *     createdAt      : string        ← ISO 8601
 *     avatarUrl      : string | null ← Cloudinary URL
 *     bio            : string
 *     followers      : number
 *     following      : number
 *
 * usernames/
 *   {username}       : string (uid)  ← unique lookup index
 */

import { auth, rtdb } from "@/lib/firebase/config";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";

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

// ─── Functions ────────────────────────────────────────────────────────────────

export async function isUsernameTaken(username: string): Promise<boolean> {
  const snap = await get(ref(rtdb, `usernames/${username}`));
  return snap.exists();
}

export async function createUser(data: NewUser): Promise<UserProfile> {
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

  await set(ref(rtdb, `users/${uid}`), profile);
  await set(ref(rtdb, `usernames/${data.username}`), uid);

  return profile;
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const snap = await get(ref(rtdb, `users/${uid}`));
  return snap.exists() ? (snap.val() as UserProfile) : null;
}

export async function updateUser(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await update(ref(rtdb, `users/${uid}`), updates);
}
