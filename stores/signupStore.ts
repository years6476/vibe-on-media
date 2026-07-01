import { create } from "zustand";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say" | "";

type SignupState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: Gender;
  password: string;
  username: string;

  setName: (first: string, middle: string, last: string) => void;
  setEmail: (email: string) => void;
  setBirthday: (dob: string, gender: Gender) => void;
  setPassword: (password: string) => void;
  setUsername: (username: string) => void;
  reset: () => void;
};

const initial = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  gender: "" as Gender,
  password: "",
  username: "",
};

export const useSignupStore = create<SignupState>((set) => ({
  ...initial,

  setName: (firstName, middleName, lastName) =>
    set({ firstName, middleName, lastName }),

  setEmail: (email) => set({ email }),

  setBirthday: (dateOfBirth, gender) => set({ dateOfBirth, gender }),

  setPassword: (password) => set({ password }),

  setUsername: (username) => set({ username }),

  reset: () => set(initial),
}));
