import Link from "next/link";
import Image from "next/image";

const TOTAL_STEPS = 5;
const PURPLE_GRADIENT = "linear-gradient(to right, #6A11CB, #7B2FF7, #A855F7)";

const BACK_ROUTES: Record<number, string> = {
  1: "/login",
  2: "/signup",
  3: "/signup/email",
  4: "/signup/birthday",
  5: "/signup/password",
};

type Props = {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function SignupLayout({ step, title, subtitle, children }: Props) {
  const backHref = BACK_ROUTES[step] ?? "/signup";

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Top bar */}
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-4 flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
        <span className="text-xs text-zinc-400 font-medium">
          Step {step} of {TOTAL_STEPS}
        </span>
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

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ background: i < step ? PURPLE_GRADIENT : "#E4E4E7" }}
              />
            ))}
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-zinc-900 text-[22px] font-semibold">{title}</h1>
            <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>
          </div>

          {/* Form (Client Component) */}
          {children}

          {/* Bottom link */}
          <p className="text-center text-zinc-400 text-[14px] mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: "#7B2FF7" }}
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}
