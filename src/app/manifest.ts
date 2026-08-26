import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pishnam Robotics Researchers",
    short_name: "Pishnam",
    description:
      "Progressive robotics, electronics, and AI education for students from elementary school through high school.",
    start_url: "/",
    display: "standalone",
    background_color: "#18222d",
    theme_color: "#18222d",
    icons: [
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
