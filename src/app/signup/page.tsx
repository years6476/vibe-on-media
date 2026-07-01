"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isUsernameTaken, createUser } from "@/lib/db/users";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | "";
  password: string;
  confirmPassword: string;
  username: string;
};

type Step = 1 | 2 | 3 | 4 | 5;

const TOTAL_STEPS: Step = 5;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PURPLE_GRADIENT = "linear-gradient(to right, #6A11CB, #7B2FF7, #A855F7)";

function PurpleButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="mx-auto block w-full max-w-[280px] text-white font-bold rounded-[8px] py-3 text-base transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: PURPLE_GRADIENT }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

function StyledInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  maxLength,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={autoComplete}
      maxLength={maxLength}
      className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 py-2.5 text-[15px] focus:outline-none transition-colors"
      onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
      onBlur={(e) => (e.target.style.borderColor = "")}
    />
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
      {message}
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-zinc-800 text-[15px] font-semibold mb-2">
      {children}
    </label>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full transition-all duration-300"
          style={{
            background: i < step ? PURPLE_GRADIENT : "#E4E4E7",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "taken" | "available"
  >("idle");

  const [form, setForm] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = useCallback(
    (field: keyof FormData) => (value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  function next() {
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS) as Step);
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1) as Step);
  }

  // ── Step validators ──

  function validateStep1() {
    if (!form.firstName.trim()) { setError("First name is required."); return false; }
    if (!form.lastName.trim()) { setError("Last name is required."); return false; }
    return true;
  }

  function validateStep2() {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) { setError("Please enter a valid email."); return false; }
    return true;
  }

  function validateStep3() {
    if (!form.dateOfBirth) { setError("Date of birth is required."); return false; }
    const dob = new Date(form.dateOfBirth);
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 13) { setError("You must be at least 13 years old."); return false; }
    if (!form.gender) { setError("Please select a gender."); return false; }
    return true;
  }

  function validateStep4() {
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return false; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return false; }
    return true;
  }

  async function validateStep5() {
    const un = form.username.trim().toLowerCase();
    if (!un) { setError("Username is required."); return false; }
    if (!/^[a-z0-9_.]{3,30}$/.test(un)) {
      setError("Username must be 3–30 characters: letters, numbers, _ or . only.");
      return false;
    }
    setUsernameStatus("checking");
    const taken = await isUsernameTaken(un);
    if (taken) {
      setUsernameStatus("taken");
      setError("That username is already taken. Please choose another.");
      return false;
    }
    setUsernameStatus("available");
    return true;
  }

  async function handleNext() {
    setError(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    next();
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const valid = await validateStep5();
    if (!valid) { setLoading(false); return; }

    try {
      await createUser({
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as "male" | "female" | "other" | "prefer_not_to_say",
        username: form.username.trim().toLowerCase(),
      });
      router.push("/feed");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  }

  // ── Username live check ──
  async function handleUsernameChange(val: string) {
    set("username")(val);
    const un = val.trim().toLowerCase();
    if (un.length < 3) { setUsernameStatus("idle"); return; }
    if (!/^[a-z0-9_.]+$/.test(un)) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const taken = await isUsernameTaken(un);
    setUsernameStatus(taken ? "taken" : "available");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Top bar */}
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-4 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
        <span className="text-xs text-zinc-400 font-medium">Step {step} of {TOTAL_STEPS}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 sm:px-8 pt-10">
        <div className="w-full max-w-[380px]">

          {/* Logo */}
          <div className="text-center mb-6">
            <Image
              src="/vibe-logo.png"
              alt="Vibe"
              width={240}
              height={120}
              priority
              unoptimized
              style={{ height: "auto" }}
              className="mx-auto w-[140px] sm:w-[160px]"
            />
          </div>

          {/* Progress */}
          <ProgressBar step={step} />

          {/* ── Step 1 — Name ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-zinc-900 text-[22px] font-semibold">What's your name?</h1>
                <p className="text-zinc-400 text-sm mt-1">Tell us what to call you</p>
              </div>

              {error && <ErrorBox message={error} />}

              <div>
                <Label htmlFor="firstName">First name</Label>
                <StyledInput id="firstName" placeholder="First name" value={form.firstName} onChange={set("firstName")} required autoComplete="given-name" />
              </div>
              <div>
                <Label htmlFor="middleName">Middle name <span className="text-zinc-400 font-normal text-[13px]">(optional)</span></Label>
                <StyledInput id="middleName" placeholder="Middle name" value={form.middleName} onChange={set("middleName")} autoComplete="additional-name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <StyledInput id="lastName" placeholder="Last name" value={form.lastName} onChange={set("lastName")} required autoComplete="family-name" />
              </div>

              <div className="pt-2">
                <PurpleButton onClick={handleNext}>Next</PurpleButton>
              </div>
            </div>
          )}

          {/* ── Step 2 — Email ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-zinc-900 text-[22px] font-semibold">What's your email?</h1>
                <p className="text-zinc-400 text-sm mt-1">We'll never share it with anyone</p>
              </div>

              {error && <ErrorBox message={error} />}

              <div>
                <Label htmlFor="email">Email address</Label>
                <StyledInput id="email" type="email" placeholder="Enter your email" value={form.email} onChange={set("email")} required autoComplete="email" />
              </div>

              <div className="pt-2">
                <PurpleButton onClick={handleNext}>Next</PurpleButton>
              </div>
            </div>
          )}

          {/* ── Step 3 — Date of birth & Gender ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-zinc-900 text-[22px] font-semibold">A bit about you</h1>
                <p className="text-zinc-400 text-sm mt-1">Date of birth &amp; gender</p>
              </div>

              {error && <ErrorBox message={error} />}

              <div>
                <Label htmlFor="dob">Date of birth</Label>
                <input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth")(e.target.value)}
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
                      onClick={() => set("gender")(opt.value)}
                      className="py-2.5 px-3 rounded-[8px] border text-[14px] font-medium transition-colors"
                      style={
                        form.gender === opt.value
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
          )}

          {/* ── Step 4 — Password ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-zinc-900 text-[22px] font-semibold">Create a password</h1>
                <p className="text-zinc-400 text-sm mt-1">At least 8 characters</p>
              </div>

              {error && <ErrorBox message={error} />}

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(e) => set("password")(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 pr-12 py-2.5 text-[15px] focus:outline-none transition-colors"
                    onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword")(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 pr-12 py-2.5 text-[15px] focus:outline-none transition-colors"
                    onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <PurpleButton onClick={handleNext}>Next</PurpleButton>
              </div>
            </div>
          )}

          {/* ── Step 5 — Username ── */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h1 className="text-zinc-900 text-[22px] font-semibold">Pick a username</h1>
                <p className="text-zinc-400 text-sm mt-1">This will be your unique identity</p>
              </div>

              {error && <ErrorBox message={error} />}

              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-[15px] select-none">@</span>
                  <input
                    id="username"
                    type="text"
                    placeholder="yourname"
                    value={form.username}
                    onChange={(e) => handleUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                    autoComplete="username"
                    maxLength={30}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] pl-8 pr-10 py-2.5 text-[15px] focus:outline-none transition-colors"
                    onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                  {/* Status icon */}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === "checking" && (
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B2FF7" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-9-9" />
                      </svg>
                    )}
                    {usernameStatus === "available" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {usernameStatus === "taken" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-1.5">Letters, numbers, underscores and dots only</p>
              </div>

              <div className="pt-2">
                <PurpleButton onClick={handleSubmit} loading={loading}>
                  Create Account
                </PurpleButton>
              </div>
            </div>
          )}

          {/* Bottom — Already have account */}
          <p className="text-center text-zinc-400 text-[14px] mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline underline-offset-2" style={{ color: "#7B2FF7" }}>
              Log in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

// ─── Eye Icon ─────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
