import type { Metadata } from "next";
import { APP_NAME } from "@/config/constants/app";
import { LandingSeo } from "@/config/constants/landing";
import { Routes } from "@/routes/routes";
import LandingPage from "@/views/landing";

export const metadata: Metadata = {
  title: { absolute: LandingSeo.title },
  description: LandingSeo.description,
  alternates: { canonical: Routes.home },
  openGraph: {
    type: "website",
    url: Routes.home,
    siteName: APP_NAME,
    title: LandingSeo.title,
    description: LandingSeo.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: LandingSeo.title,
    description: LandingSeo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function Page() {
  return <LandingPage />;
}
