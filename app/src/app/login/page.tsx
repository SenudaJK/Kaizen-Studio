"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogoIcon } from "@phosphor-icons/react/dist/csr/GoogleLogo";
import {
  AuthCard,
  AuthInput,
  AuthPrimaryButton,
  AuthSecondaryButton,
  AuthDivider,
} from "@/components/auth-card";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthCard
      eyebrow="Member Access"
      title="Log in to Kaizen Studio"
      subtitle="We don't question what we don't measure."
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-medium text-terracotta hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <AuthSecondaryButton type="button" onClick={() => signIn("google", { callbackUrl })}>
        <GoogleLogoIcon size={16} weight="bold" />
        Continue with Google
      </AuthSecondaryButton>

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-3">
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-terracotta font-medium">{error}</p>}
        <AuthPrimaryButton type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </AuthPrimaryButton>
      </form>
    </AuthCard>
  );
}
