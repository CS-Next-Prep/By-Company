import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { getAllCompanies } from "@/lib/data";

// Font: system font stack (SF Pro on macOS/iOS, Segoe UI on Windows, etc.)
// This matches the user's request for SF Pro / Apple-style typography.
// No external font load needed — entirely native.

export const metadata: Metadata = {
  title: "ByCompany — CS-Next",
  description:
    "Company-wise LeetCode interview questions, sourced from public data. Free. No login.",
  keywords: ["LeetCode", "interview", "company-wise", "CS-Next", "coding interview"],
  openGraph: {
    title: "ByCompany — CS-Next",
    description: "Company-wise LeetCode interview questions, sourced from public data. Free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companies = getAllCompanies();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Logo.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Intro animation removed per user request */}
        <SiteHeader companies={companies} />

        <a href="#main-content" className="skip-to-main" tabIndex={0}>
          Skip to main content
        </a>

        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
