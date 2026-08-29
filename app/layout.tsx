import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const base = new URL(`${protocol}://${host}`);

  return {
    metadataBase: base,
    title: "Space + Calendar",
    description: "A clear personal space for work and time.",
    openGraph: {
      title: "Space + Calendar",
      description: "A clear personal space for work and time.",
      images: [{ url: new URL("/og.png", base).toString(), width: 1680, height: 945, alt: "Space + Calendar" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Space + Calendar",
      description: "A clear personal space for work and time.",
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
