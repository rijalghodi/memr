import { Metadata } from "next";

export const BRAND = {
  AUTHOR: "Rijal Ghodi",
  EMAIL: "rijalghodi.dev@gmail.com",
  SITE_NAME: "Memr - AI-powered second brain",
  APP_NAME: "Memr",
  APP_TAGLINE: "AI-powered second brain",
  OG_IMAGE_URL: `${process.env.NEXT_PUBLIC_SITE_URL}/opengraph-image.png`,
  SITE_DESCRIPTION:
    "Memr is a platform for managing your tasks, projects, and notes with powerful AI. Your second brain in the cloud.",
  KEYWORDS: ["Memr", "Memories", "Thoughts", "Notes", "Journals"],
};

export const metadata: Metadata = {
  title: {
    default: BRAND.SITE_NAME,
    template: `%s | ${BRAND.AUTHOR} - ${BRAND.SITE_NAME}`,
  },
  authors: [{ name: BRAND.AUTHOR, url: BRAND.EMAIL }],
  creator: BRAND.AUTHOR,
  applicationName: BRAND.SITE_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://memr.co"),
  openGraph: {
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: BRAND.SITE_NAME,
    description: BRAND.SITE_DESCRIPTION,
    siteName: BRAND.SITE_NAME,
    images: [BRAND.OG_IMAGE_URL],
  },
  twitter: {
    title: BRAND.SITE_NAME,
    description: BRAND.SITE_DESCRIPTION,
    site: "@memr_co",
    card: "summary_large_image",
    creator: "@memr_co",
    images: [BRAND.OG_IMAGE_URL],
  },
  keywords: BRAND.KEYWORDS,
  description: BRAND.SITE_DESCRIPTION,
};
