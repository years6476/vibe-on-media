"use client";

const PURPLE_GRADIENT = "linear-gradient(to right, #6A11CB, #7B2FF7, #A855F7)";

export function PurpleButton({
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

export function StyledInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  maxLength,
  prefix,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-[15px] select-none">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className="w-full bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-[8px] py-2.5 text-[15px] focus:outline-none transition-colors"
        style={{ paddingLeft: prefix ? "2rem" : "1rem", paddingRight: "1rem" }}
        onFocus={(e) => (e.target.style.borderColor = "#7B2FF7")}
        onBlur={(e) => (e.target.style.borderColor = "")}
      />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
      {message}
    </div>
  );
}

export function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-zinc-800 text-[15px] font-semibold mb-2">
      {children}
    </label>
  );
}

export function EyeToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
    >
      {show ? (
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
  );
}
