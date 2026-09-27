import { Brand } from "@/components/brand";
import { LoginCard } from "@/components/login-card";
import { parseEnabledAuthProviders } from "@/lib/auth-providers";
import { findActiveClient } from "@/lib/clients";
import { getServerEnv } from "@/lib/env";
import { safeReturnTo } from "@/lib/urls";
import { MaterialBackground } from "@/components/material-background";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ return_to?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.return_to ?? null);
  const targetUrl = new URL(returnTo, "https://auth.aramon.ma");
  const clientId = targetUrl.pathname === "/authorize" ? targetUrl.searchParams.get("client_id") : null;
  const applicationName = clientId
    ? findActiveClient(getServerEnv().clients, clientId)?.name ?? null
    : null;

  return (
    <main className="shell">
      <MaterialBackground />
      <section className="card">
        <Brand />
        <h1>One account for every Aramon space.</h1>
        <p>Sign in securely to continue. Your password is never shared with the application.</p>
        <LoginCard
          mode="login"
          returnTo={returnTo}
          applicationName={applicationName}
          providers={parseEnabledAuthProviders(process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDERS)}
        />
        <p className="footnote">Only applications registered by Aramon can request access.</p>
      </section>
    </main>
  );
}
