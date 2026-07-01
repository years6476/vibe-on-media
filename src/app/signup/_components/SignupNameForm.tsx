"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/stores/signupStore";
import { PurpleButton, StyledInput, ErrorBox, Label } from "./SignupUI";

export default function SignupNameForm() {
  const router = useRouter();
  const { firstName, middleName, lastName, setName } = useSignupStore();

  const [first, setFirst] = useState(firstName);
  const [middle, setMiddle] = useState(middleName);
  const [last, setLast] = useState(lastName);
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!first.trim()) { setError("First name is required."); return; }
    if (!last.trim()) { setError("Last name is required."); return; }
    setName(first.trim(), middle.trim(), last.trim());
    router.push("/signup/email");
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBox message={error} />}

      <div>
        <Label htmlFor="firstName">First name</Label>
        <StyledInput id="firstName" placeholder="First name" value={first}
          onChange={(v) => { setFirst(v); setError(null); }}
          required autoComplete="given-name" />
      </div>

      <div>
        <Label htmlFor="middleName">
          Middle name{" "}
          <span className="text-zinc-400 font-normal text-[13px]">(optional)</span>
        </Label>
        <StyledInput id="middleName" placeholder="Middle name" value={middle}
          onChange={setMiddle} autoComplete="additional-name" />
      </div>

      <div>
        <Label htmlFor="lastName">Last name</Label>
        <StyledInput id="lastName" placeholder="Last name" value={last}
          onChange={(v) => { setLast(v); setError(null); }}
          required autoComplete="family-name" />
      </div>

      <div className="pt-2">
        <PurpleButton onClick={handleNext}>Next</PurpleButton>
      </div>
    </div>
  );
}
