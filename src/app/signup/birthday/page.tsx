import type { Metadata } from "next";
import SignupBirthdayForm from "../_components/SignupBirthdayForm";
import SignupLayout from "../_components/SignupLayout";

export const metadata: Metadata = {
  title: "Date of Birth — Vibe",
  description: "Tell us your date of birth and gender.",
};

export default function SignupBirthdayPage() {
  return (
    <SignupLayout step={3} title="A bit about you" subtitle="Date of birth & gender">
      <SignupBirthdayForm />
    </SignupLayout>
  );
}
