"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore, type Gender } from "@/stores/signupStore";
import { PurpleButton, ErrorBox, Label } from "./SignupUI";

const PURPLE_GRADIENT = "linear-gradient(to right, #6A11CB, #7B2FF7, #A855F7)";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function SignupBirthdayForm() {
  const router = useRouter();
  const { dateOfBirth: savedDob, gender: savedGender, setBirthday } = useSignupStore();

  const [dob, setDob] = useState(savedDob);
  const [gender, setGender] = useState<Gender>(savedGender);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!dob) { setError("Date of birth is required."); return; }
    const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 13) { setError("You must be at least 13 years old."); return; }
    if (!gender) { setError("Please select a gender."); return; }
    setBirthday(dob, gender);
    router.push("/signup/password");
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBox message={error} />}

      <div>
        <Label htmlFor="dob">Date of birth</Label>
        <input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => { setDob(e.target.value); setError(null); }}
          max={new Date().toISOString().split("T")[0]}
          className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-[8px] px-4 py-2.5 text-[15px] focus:outline-none transition-colors"
          onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
          onBlur={(e) => (e.target.style.borderColor = "")}
        />
      </div>

      <div>
        <Label htmlFor="gender">Gender</Label>
        <div className="grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setGender(opt.value); setError(null); }}
              className="py-2.5 px-3 rounded-[8px] border text-[14px] font-medium transition-colors"
              style={
                gender === opt.value
                  ? { background: PURPLE_GRADIENT, color: "#fff", border: "none" }
                  : { borderColor: "#E4E4E7", color: "#3F3F46" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <PurpleButton onClick={handleNext}>Next</PurpleButton>
      </div>
    </div>
  );
      }
