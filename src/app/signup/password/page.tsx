import type { Metadata } from "next";
import SignupPasswordForm from "../_components/SignupPasswordForm";
import SignupLayout from "../_components/SignupLayout";

export const metadata: Metadata = {
  title: "Create Password — Vibe",
  description: "Create a strong password for your Vibe account.",
};

export default function SignupPasswordPage() {
  return (
    <SignupLayout step={4} title="Create a password" subtitle="At least 8 characters">
      <SignupPasswordForm />
    </SignupLayout>
  );
}
