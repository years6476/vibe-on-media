"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/stores/signupStore";
import { isUsernameTaken, createUser } from "@/lib/db/users";
import { PurpleButton, ErrorBox, Label } from "./SignupUI";

type Status = "idle" | "checking" | "taken" | "available";

export default function SignupUsernameForm() {
  const router = useRouter();
  const store = useSignupStore();

  const [username, setUsername] = useState(store.username);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time username check (debounced 500ms)
  useEffect(() => {
    const un = username.trim();
    if (un.length < 3) { setStatus("idle"); return; }
    if (!/^[a-z0-9_.]+$/.test(un)) { setStatus("idle"); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatus("checking");

    debounceRef.current = setTimeout(async () => {
      const taken = await isUsernameTaken(un);
      setStatus(taken ? "taken" : "available");
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  function handleChange(val: string) {
    // শুধু valid character allow করো
    const clean = val.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setUsername(clean);
    setError(null);
  }

  async function handleSubmit() {
    const un = username.trim();
    if (!un) { setError("Username is required."); return; }
    if (!/^[a-z0-9_.]{3,30}$/.test(un)) {
      setError("3–30 characters: letters, numbers, _ or . only.");
      return;
    }
    if (status === "taken") { setError("That username is already taken."); return; }
    if (status === "checking") { setError("Still checking username..."); return; }

    // Store এ save করো
    store.setUsername(un);

    setLoading(true);
    setError(null);

    try {
      await createUser({
        firstName: store.firstName,
        middleName: store.middleName || undefined,
        lastName: store.lastName,
        email: store.email,
        password: store.password,
        dateOfBirth: store.dateOfBirth,
        gender: store.gender as "male" | "female" | "other" | "prefer_not_to_say",
        username: un,
      });

      store.reset();
      router.push("/feed");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBox message={error} />}

      <div>
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-[15px] select-none">
            @
          </span>
          <input
            id="username"
            type="text"
            placeholder="yourname"
            value={username}
            onChange={(e) => handleChange(e.target.value)}
            autoComplete="username"
            maxLength={30}
            className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] pl-8 pr-10 py-2.5 text-[15px] focus:outline-none transition-colors"
            onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
            onBlur={(e) => (e.target.style.borderColor = "")}
          />

          {/* Status icon */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {status === "checking" && (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#7B2FF7" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-9-9" />
              </svg>
            )}
            {status === "available" && (
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#22c55e" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {status === "taken" && (
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#ef4444" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </span>
        </div>
        <p className="text-zinc-400 text-xs mt-1.5">
          Letters, numbers, _ and . only • 3–30 characters
        </p>
      </div>

      <div className="pt-2">
        <PurpleButton
          onClick={handleSubmit}
          loading={loading}
          disabled={status === "taken" || status === "checking"}
        >
          Create Account
        </PurpleButton>
      </div>
    </div>
  );
}
