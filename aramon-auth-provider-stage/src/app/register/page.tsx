import { Brand } from "@/components/brand";
import { LoginCard } from "@/components/login-card";
import { parseEnabledAuthProviders } from "@/lib/auth-providers";
import { findActiveClient } from "@/lib/clients";
import { getServerEnv } from "@/lib/env";
import { safeReturnTo } from "@/lib/urls";
import { MaterialBackground } from "@/components/material-background";

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams: Promise<{ return_to?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
      <section className="card wide-card">
        <Brand />
        <h1>Create your Aramon account.</h1>
        <p>Registration establishes your identity. Each Aramon application grants access separately.</p>
        <LoginCard
          mode="register"
          returnTo={returnTo}
          applicationName={applicationName}
          providers={parseEnabledAuthProviders(process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDERS)}
        />
        <p className="footnote">Creating an account does not automatically grant access to Classroom or another application.</p>
      </section>
    </main>
  );
}
