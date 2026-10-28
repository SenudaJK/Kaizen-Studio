"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogoIcon } from "@phosphor-icons/react/dist/csr/GoogleLogo";
import {
  AuthCard,
  AuthInput,
  AuthPrimaryButton,
  AuthSecondaryButton,
  AuthDivider,
} from "@/components/auth-card";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard
      eyebrow="New Member"
      title="Create your account"
      subtitle="Start treating your habits like processes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-terracotta hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <AuthSecondaryButton type="button" onClick={() => signIn("google", { callbackUrl: "/" })}>
        <GoogleLogoIcon size={16} weight="bold" />
        Continue with Google
      </AuthSecondaryButton>

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <AuthInput
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthInput
          type="password"
          required
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-terracotta font-medium">{error}</p>}
        <AuthPrimaryButton type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </AuthPrimaryButton>
      </form>
    </AuthCard>
  );
}
