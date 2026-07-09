import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start with Veltra — Sign Up",
  description: "Set up your clinic on Veltra in 3 steps. 14-day free trial. No credit card required. Cancel anytime.",
  openGraph: {
    title: "Start with Veltra",
    description: "The Clinic Operating System. 14-day free trial.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
