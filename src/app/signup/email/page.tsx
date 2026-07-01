import type { Metadata } from "next";
import SignupEmailForm from "../_components/SignupEmailForm";
import SignupLayout from "../_components/SignupLayout";

export const metadata: Metadata = {
  title: "Your Email — Vibe",
  description: "Enter your email address to create your Vibe account.",
};

export default function SignupEmailPage() {
  return (
    <SignupLayout step={2} title="What's your email?" subtitle="We'll never share it with anyone">
      <SignupEmailForm />
    </SignupLayout>
  );
}
