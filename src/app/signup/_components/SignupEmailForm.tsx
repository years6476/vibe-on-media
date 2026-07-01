"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/stores/signupStore";
import { PurpleButton, StyledInput, ErrorBox, Label } from "./SignupUI";

export default function SignupEmailForm() {
  const router = useRouter();
  const { email: saved, setEmail } = useSignupStore();

  const [email, setLocalEmail] = useState(saved);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) { setError("Please enter a valid email address."); return; }
    setEmail(email.trim());
    router.push("/signup/birthday");
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBox message={error} />}

      <div>
        <Label htmlFor="email">Email address</Label>
        <StyledInput id="email" type="email" placeholder="Enter your email"
          value={email} onChange={(v) => { setLocalEmail(v); setError(null); }}
          required autoComplete="email" />
      </div>

      <div className="pt-2">
        <PurpleButton onClick={handleNext}>Next</PurpleButton>
      </div>
    </div>
  );
}
