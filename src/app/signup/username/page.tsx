import type { Metadata } from "next";
import SignupUsernameForm from "../_components/SignupUsernameForm";
import SignupLayout from "../_components/SignupLayout";

export const metadata: Metadata = {
  title: "Pick a Username — Vibe",
  description: "Choose your unique username on Vibe.",
};

export default function SignupUsernamePage() {
  return (
    <SignupLayout step={5} title="Pick a username" subtitle="Your unique identity on Vibe">
      <SignupUsernameForm />
    </SignupLayout>
  );
}
