"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/stores/signupStore";
import { PurpleButton, ErrorBox, Label, EyeToggle } from "./SignupUI";

export default function SignupPasswordForm() {
  const router = useRouter();
  const { setPassword } = useSignupStore();

  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (pass.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pass !== confirm) { setError("Passwords do not match."); return; }
    setPassword(pass);
    router.push("/signup/username");
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBox message={error} />}

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? "text" : "password"}
            placeholder="Create a password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(null); }}
            autoComplete="new-password"
            className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 pr-12 py-2.5 text-[15px] focus:outline-none transition-colors"
            onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />
          <EyeToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
        </div>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(null); }}
            autoComplete="new-password"
            className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 pr-12 py-2.5 text-[15px] focus:outline-none transition-colors"
            onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />
          <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
        </div>
      </div>

      <div className="pt-2">
        <PurpleButton onClick={handleNext}>Next</PurpleButton>
      </div>
    </div>
  );
}
