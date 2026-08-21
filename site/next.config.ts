import type { NextConfig } from "next";

// Static export: site ships as pure HTML/CSS/JS — no server required.
// AGENTS.md Section 6: "Framework: Next.js with static export"
// AGENTS.md Section 4: "Must cost close to $0 to run"
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Static export requires unoptimized images (no server-side image optimization)
    unoptimized: true,
  },
};

export default nextConfig;
