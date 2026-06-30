export type LoginTranslation = {
  help: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  loginButton: string;
  loggingIn: string;
  noAccount: string;
  signUp: string;
  errorInvalidCredential: string;
  errorTooManyRequests: string;
  errorGeneric: string;
  showPassword: string;
  hidePassword: string;
};

export const TRANSLATIONS: Record<string, LoginTranslation> = {
  bn: {
    help: "সাহায্য",
    welcomeTitle: "স্বাগতম! 👋",
    welcomeSubtitle: "আপনার যাত্রা চালিয়ে যেতে লগইন করুন",
    emailLabel: "ইমেইল",
    emailPlaceholder: "আপনার ইমেইল লিখুন",
    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "আপনার পাসওয়ার্ড লিখুন",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    loginButton: "লগইন করুন",
    loggingIn: "লগইন হচ্ছে...",
    noAccount: "অ্যাকাউন্ট নেই?",
    signUp: "সাইন আপ করুন",
    errorInvalidCredential: "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।",
    errorTooManyRequests: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    errorGeneric: "লগইন করা যায়নি। আবার চেষ্টা করুন।",
    showPassword: "পাসওয়ার্ড দেখান",
    hidePassword: "পাসওয়ার্ড লুকান",
  },
  en: {
    help: "Help",
    welcomeTitle: "Welcome back! 👋",
    welcomeSubtitle: "Log in to continue your journey",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    loginButton: "Login",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    errorInvalidCredential: "Incorrect email or password.",
    errorTooManyRequests: "Too many attempts. Please try again later.",
    errorGeneric: "Login failed. Please try again.",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
};

export const DEFAULT_LANGUAGE_CODE = "bn";
