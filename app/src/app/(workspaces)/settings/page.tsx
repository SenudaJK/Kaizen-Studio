import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, Eyebrow, SectionHeader } from "@/components/ui/card";
import { requireUserId } from "@/lib/session";
import { DeleteAccount } from "@/features/account/components/delete-account";
import { PasswordForm } from "@/features/account/components/password-form";
import { ProfileForm } from "@/features/account/components/profile-form";
import { getAccountSettings } from "@/features/account/queries";

export const metadata: Metadata = { title: "Account & settings · Kaizen Studio" };

/** Account page. Gathers data and arranges sections; the rules live in features/account/domain. */
export default async function SettingsPage() {
  const userId = await requireUserId();
  const account = await getAccountSettings(userId);
  if (!account) redirect("/login");

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="border-b border-stoneDark pb-6">
        <Eyebrow tone="slate">Account</Eyebrow>
        <h1 className="font-serif text-4xl lg:text-5xl text-espresso tracking-tight mt-1">Account &amp; settings</h1>
        <p className="text-slateWarm text-sm mt-1.5">
          Member since {account.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}.
        </p>
      </div>

      <Card>
        <SectionHeader eyebrow="Profile" tone="sage" title="About you" />
        <ProfileForm name={account.name} email={account.email} />
      </Card>

      <Card>
        <SectionHeader eyebrow="Security" tone="sage" title="Password" />
        {account.hasPassword ? (
          <PasswordForm />
        ) : (
          <p className="text-sm text-slateWarm">You sign in with Google, so there&apos;s no password to change here.</p>
        )}
      </Card>

      <Card>
        <SectionHeader
          eyebrow="Danger zone"
          tone="terracotta"
          title="Delete account"
          description="Permanently erase your account and everything you've tracked."
        />
        <DeleteAccount email={account.email} />
      </Card>
    </div>
  );
}
