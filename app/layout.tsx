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
    title: "Aramon Focus Architecture — Component Study",
    description: "Four softer liquid materials and the Desk, Frame, Medium, and Lamp interface language for Aramon.",
    icons: { icon: "/aramon-mark.svg", shortcut: "/aramon-mark.svg" },
    openGraph: {
      title: "Aramon Focus Architecture",
      description: "Softer by nature. Four interactive liquid-material directions for Aramon.",
      images: [{ url: new URL("/og.png", base).toString(), width: 1680, height: 945, alt: "Aramon Focus Architecture" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Aramon Focus Architecture",
      description: "Softer by nature. Four interactive liquid-material directions for Aramon.",
      images: [new URL("/og.png", base).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><script src="/medium.js" defer /></head><body>{children}</body></html>;
}
