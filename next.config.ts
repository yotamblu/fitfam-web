import type { NextConfig } from "next";

// Where the Spring Boot API runs (server side only; never exposed to the browser).
const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // The browser only ever talks to this site: /backend/* is forwarded to the API. That keeps the login cookie
  // first-party (iOS Safari drops cookies from a different host) and means the API itself never needs a public URL.
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${apiOrigin}/:path*` }];
  },

  // Dev only: let phones/friends load the dev server through a Cloudflare quick tunnel or the LAN.
  // Without this Next blocks its client JS for any non-localhost host, so nothing hydrates.
  allowedDevOrigins: ["*.trycloudflare.com", "10.0.0.18"],
};

export default nextConfig;
