import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ACWS 2027 Admin Portal",
    short_name: "ACWS Admin",
    description: "Africa-Caribbean Women's Summit 2027 - Official Admin Portal, Curation Desk & Live Telemetry",
    start_url: "/dashboard",
    id: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FFFFFF",
    theme_color: "#D4AF37",
    categories: ["business", "productivity", "management"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/dashboard",
        description: "View live analytics and event KPIs"
      },
      {
        name: "Vendors Directory",
        url: "/vendors",
        description: "Review and curate exhibitor applications"
      },
      {
        name: "Attendees & Guests",
        url: "/attendees",
        description: "Guest pass check-in and attendee lists"
      },
      {
        name: "Settings & Ops",
        url: "/settings",
        description: "Profile, security, and operational quotas"
      }
    ]
  };
}
