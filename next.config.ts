import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let phones/friends load the dev server through a Cloudflare quick tunnel or the LAN.
  // Without this Next blocks its client JS for any non-localhost host, so nothing hydrates.
  allowedDevOrigins: ["*.trycloudflare.com", "10.0.0.18"],
};

export default nextConfig;
