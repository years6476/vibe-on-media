"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { COUNTRIES, type CountryOption } from "@/lib/i18n/countries";
import { getTranslation } from "@/lib/i18n/useTranslation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRIES.find((c) => c.code === "us") ?? COUNTRIES[0]
  );

  const t = getTranslation(selectedCountry.langCode);
  const isRtl =
    selectedCountry.langCode === "ar" ||
    selectedCountry.langCode === "ur" ||
    selectedCountry.langCode === "fa";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/feed");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError(t.errorInvalidCredential);
      } else if (code === "auth/too-many-requests") {
        setError(t.errorTooManyRequests);
      } else {
        setError(t.errorGeneric);
      }
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col" dir={isRtl ? "rtl" : "ltr"}>

      {/* Top bar */}
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-4 flex items-center justify-between">

        {/* Help — question mark বড় */}
        <Link
          href="/help"
          className="flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900 transition-colors group"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-zinc-500 bg-zinc-50">
            <svg
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.6" fill="currentColor" />
            </svg>
          </span>
          <span className="text-sm font-medium group-hover:underline underline-offset-2">
            {t.help}
          </span>
        </Link>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 border border-zinc-300 rounded-full pl-2.5 pr-2 py-1 text-zinc-700 hover:border-zinc-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
            </svg>
            <span className="text-xs font-medium">{selectedCountry.label}</span>
            <svg
              width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform flex-shrink-0 ${langOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-44 max-h-64 overflow-y-auto bg-white border border-zinc-200 rounded-xl shadow-lg z-30 py-1">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => { setSelectedCountry(country); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 transition-colors leading-tight ${
                      country.code === selectedCountry.code
                        ? "font-semibold"
                        : "text-zinc-700"
                    }`}
                    style={country.code === selectedCountry.code ? { color: "#7B2FF7" } : {}}
                  >
                    <span className="font-medium">{country.country}</span>
                    <span className="text-zinc-400 ml-1">({country.label})</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main content — একটু নিচে */}
      <div className="flex-1 flex flex-col items-center px-6 sm:px-8 pt-14">
        <div className="w-full max-w-[380px]">

          {/* Logo */}
          <div className="text-center mb-2">
            <Image
              src="/vibe-logo.png"
              alt="Vibe"
              width={240}
              height={120}
              priority
              unoptimized
              style={{ height: "auto" }}
              className="mx-auto w-[210px] sm:w-[240px]"
            />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-5">
            <h1 className="text-zinc-900 text-[22px] sm:text-[24px] font-semibold tracking-tight">
              {t.welcomeTitle}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-zinc-800 text-[15px] font-semibold mb-2">
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 transition-colors"
                style={{ ["--tw-ring-color" as string]: "#7B2FF7" }}
                onFocus={e => e.target.style.borderColor = "#7B2FF7"}
                onBlur={e => e.target.style.borderColor = ""}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-zinc-800 text-[15px] font-semibold mb-2">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] px-4 pr-12 py-2.5 text-[15px] focus:outline-none focus:ring-2 transition-colors"
                  onFocus={e => e.target.style.borderColor = "#7B2FF7"}
                  onBlur={e => e.target.style.borderColor = ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? (
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
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password — বেগুনি */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-[14px] font-medium hover:underline underline-offset-2 transition-colors"
                style={{ color: "#7B2FF7" }}
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Login button — বেগুনি gradient */}
            <button
              type="submit"
              disabled={loading}
              className="block mx-auto w-full max-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-[8px] py-3 text-base transition-opacity"
              style={{ background: "linear-gradient(to right, #6A11CB, #7B2FF7, #A855F7)" }}
            >
              {loading ? t.loggingIn : t.loginButton}
            </button>
          </form>

          {/* OR divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-zinc-400 text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          {/* Create new account — হালকা বেগুনি stroke, চিকন, বেগুনি টেক্সট */}
          <Link
            href="/signup"
            className="flex items-center justify-center w-full font-semibold rounded-full py-2.5 text-[15px] transition-colors hover:bg-purple-50"
            style={{ border: "1px solid #C084FC", color: "#7B2FF7" }}
          >
            Create new account
          </Link>

        </div>
      </div>
    </main>
  );
}
