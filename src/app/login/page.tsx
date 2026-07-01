"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

const LANGUAGES = [
  { code: "us", country: "United States", label: "English" },
  { code: "gb", country: "United Kingdom", label: "English" },
  { code: "bd", country: "Bangladesh", label: "বাংলা" },
  { code: "in", country: "India", label: "हिन्दी" },
  { code: "sa", country: "Saudi Arabia", label: "العربية" },
  { code: "fr", country: "France", label: "Français" },
  { code: "de", country: "Germany", label: "Deutsch" },
  { code: "es", country: "Spain", label: "Español" },
  { code: "it", country: "Italy", label: "Italiano" },
  { code: "pt", country: "Portugal", label: "Português" },
  { code: "ru", country: "Russia", label: "Русский" },
  { code: "cn", country: "China", label: "中文" },
  { code: "jp", country: "Japan", label: "日本語" },
  { code: "kr", country: "South Korea", label: "한국어" },
  { code: "tr", country: "Turkey", label: "Türkçe" },
  { code: "id", country: "Indonesia", label: "Bahasa Indonesia" },
  { code: "vn", country: "Vietnam", label: "Tiếng Việt" },
  { code: "pk", country: "Pakistan", label: "اردو" },
  { code: "th", country: "Thailand", label: "ไทย" },
  { code: "ng", country: "Nigeria", label: "English" },
] as const;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<(typeof LANGUAGES)[number]>(LANGUAGES[0]);

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
        setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।");
      } else if (code === "auth/too-many-requests") {
        setError("অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
      } else {
        setError("লগইন করা যায়নি। আবার চেষ্টা করুন।");
      }
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-5 flex items-center justify-between">
        {/* Help */}
        <Link
          href="/help"
          className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <span className="text-sm font-medium">Help</span>
        </Link>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-600 rounded-full pl-3 pr-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-400 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
            </svg>
            <span className="text-sm font-medium">{selectedLanguage.label}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 max-h-72 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-30 py-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                    lang.code === selectedLanguage.code
                      ? "text-violet-600 dark:text-violet-400 font-medium"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {lang.country} ({lang.label})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 sm:px-8 pt-8 sm:pt-12">
        <div className="w-full max-w-[380px]">

          {/* Logo — light মোডে কালো লোগো, dark মোডে সাদা লোগো */}
          <div className="text-center mt-2 mb-4">
            <Image
              src="/socialfeed-logo-light.png"
              alt="SocialFeed"
              width={300}
              height={150}
              priority
              className="mx-auto h-auto w-[150px] sm:w-[170px] dark:hidden"
            />
            <Image
              src="/socialfeed-logo-dark.png"
              alt="SocialFeed"
              width={300}
              height={150}
              priority
              className="mx-auto h-auto w-[150px] sm:w-[170px] hidden dark:block"
            />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h1 className="text-zinc-900 dark:text-white text-[26px] sm:text-3xl font-bold tracking-tight">
              Welcome back! 👋
            </h1>
            <p className="text-zinc-400 dark:text-zinc-500 text-base mt-2">
              Log in to continue your journey
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-zinc-800 dark:text-zinc-200 text-[15px] font-bold mb-2.5"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 rounded-[8px] pl-12 pr-4 py-2.5 text-[15px] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="password" className="text-zinc-800 dark:text-zinc-200 text-[15px] font-bold">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 rounded-[8px] pl-12 pr-12 py-2.5 text-[15px] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
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

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-violet-600 text-[15px] font-medium hover:text-violet-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-[8px] py-3 text-base transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-zinc-400 dark:text-zinc-500 text-[15px] mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-violet-600 hover:text-violet-700 font-bold transition-colors"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}
