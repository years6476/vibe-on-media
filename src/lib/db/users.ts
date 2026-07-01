/**
 * src/lib/db/users.ts
 *
 * User সংক্রান্ত সব database operation এখানে।
 * Firebase এবং VPS (REST API) দুটো implementation ই এক ফাইলে রাখা আছে।
 * adapter.ts এ DB_ADAPTER = "api" করলেই VPS mode এ চলে যাবে।
 *
 * ─── Data structure (Firebase Realtime DB) ───────────────────────────────────
 *
 * users/
 *   {uid}/
 *     uid            : string
 *     firstName      : string
 *     middleName     : string   (empty string if not provided)
 *     lastName       : string
 *     displayName    : string   (firstName + middleName + lastName)
 *     email          : string
 *     username       : string   (lowercase, unique)
 *     dateOfBirth    : string   ("YYYY-MM-DD")
 *     gender         : string
 *     createdAt      : string   (ISO 8601)
 *     avatarUrl      : string | null
 *     bio            : string
 *     followers      : number
 *     following      : number
 *
 * usernames/
 *   {username}       : string (uid)   ← unique lookup index
 *
 * ─── VPS তে migrate করতে হলে ────────────────────────────────────────────────
 *
 * ১. MongoDB তে "users" collection বানাও।
 *    Schema উপরের structure এর মতোই থাকবে।
 *
 * ২. Firebase Realtime DB থেকে export:
 *    Firebase Console → Realtime Database → ⋮ → Export JSON
 *    এই JSON এর "users" object টা MongoDB এ import করো।
 *    uid গুলো MongoDB এর _id হিসেবে রাখো — তাহলে কোনো reference ভাঙবে না।
 *
 * ৩. Firebase Auth থেকে user list export:
 *    firebase auth:export users.json --format=json (Firebase CLI)
 *    এই data থেকে email + uid mapping টা নিজের auth system এ রাখো।
 *
 * ৪. adapter.ts এ DB_ADAPTER = "api" করো।
 *    নিচের api: {} block এর functions গুলো কাজ করবে।
 */

import { DB_ADAPTER, API_BASE_URL } from "./adapter";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NewUser = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  username: string;   // lowercase, already validated
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

// ─── Firebase implementation ──────────────────────────────────────────────────

const firebase = {
  async isUsernameTaken(username: string): Promise<boolean> {
    const { getDatabase, ref, get } = await import("firebase/database");
    const { app } = await import("@/lib/firebase/config");
    const db = getDatabase(app);
    const snap = await get(ref(db, `usernames/${username}`));
    return snap.exists();
  },

  async createUser(data: NewUser): Promise<UserProfile> {
    const { getAuth, createUserWithEmailAndPassword, updateProfile } =
      await import("firebase/auth");
    const { getDatabase, ref, set } = await import("firebase/database");
    const { app } = await import("@/lib/firebase/config");

    const auth = getAuth(app);
    const db = getDatabase(app);

    // ১. Firebase Auth এ account বানাও
    const credential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const { uid } = credential.user;

    const displayName = [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(" ");

    // ২. Auth profile এ displayName সেট করো
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

    // ৩. Realtime DB তে user profile সেভ করো
    //    এই exact structure টাই VPS এ migrate হবে
    await set(ref(db, `users/${uid}`), profile);

    // ৪. Username → uid index (unique lookup)
    await set(ref(db, `usernames/${data.username}`), uid);

    return profile;
  },

  async getUserById(uid: string): Promise<UserProfile | null> {
    const { getDatabase, ref, get } = await import("firebase/database");
    const { app } = await import("@/lib/firebase/config");
    const db = getDatabase(app);
    const snap = await get(ref(db, `users/${uid}`));
    return snap.exists() ? (snap.val() as UserProfile) : null;
  },

  async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const { getDatabase, ref, update } = await import("firebase/database");
    const { app } = await import("@/lib/firebase/config");
    const db = getDatabase(app);
    await update(ref(db, `users/${uid}`), updates);
  },
};

// ─── VPS / REST API implementation ───────────────────────────────────────────
// VPS কিনলে এই block টা fill করো। adapter.ts এ DB_ADAPTER = "api" করো।

const api = {
  async isUsernameTaken(username: string): Promise<boolean> {
    const res = await fetch(
      `${API_BASE_URL}/api/users/check-username?username=${username}`
    );
    const data = await res.json();
    return data.taken as boolean;
  },

  async createUser(data: NewUser): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw Object.assign(new Error(err.message), { code: err.code });
    }
    return res.json() as Promise<UserProfile>;
  },

  async getUserById(uid: string): Promise<UserProfile | null> {
    const res = await fetch(`${API_BASE_URL}/api/users/${uid}`);
    if (!res.ok) return null;
    return res.json() as Promise<UserProfile>;
  },

  async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    await fetch(`${API_BASE_URL}/api/users/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  },
};

// ─── Exported functions (adapter দেখে সঠিক implementation ব্যবহার করে) ──────

const impl = DB_ADAPTER === "firebase" ? firebase : api;

export const isUsernameTaken = (username: string) =>
  impl.isUsernameTaken(username);

export const createUser = (data: NewUser) =>
  impl.createUser(data);

export const getUserById = (uid: string) =>
  impl.getUserById(uid);

export const updateUser = (uid: string, updates: Partial<UserProfile>) =>
  impl.updateUser(uid, updates);
