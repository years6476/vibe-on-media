import type { Metadata } from "next";
import SignupNameForm from "./_components/SignupNameForm";
import SignupLayout from "./_components/SignupLayout";

export const metadata: Metadata = {
  title: "Sign Up — Vibe",
  description: "Create your Vibe account and join the community.",
};

export default function SignupNamePage() {
  return (
    <SignupLayout step={1} title="What's your name?" subtitle="Tell us what to call you">
      <SignupNameForm />
    </SignupLayout>
  );
}
