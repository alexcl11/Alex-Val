import type { NextConfig } from "next";
// @ts-expect-error next-pwa does not have perfect typings
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "hajjotqigajvonutthfa.supabase.co" },
      { protocol: "https", hostname: "drive.google.com" },
    ],
  },
};

export default withPWA(nextConfig);
