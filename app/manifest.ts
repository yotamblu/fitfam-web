import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitFam",
    short_name: "FitFam",
    description: "אימון היברידי, רצף וקהילה",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "he",
    dir: "rtl",
    background_color: "#131314",
    theme_color: "#131314",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
