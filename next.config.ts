import type { NextConfig } from "next";

const API_DOMAIN = "shoppe-fake-427087851138.asia-southeast1.run.app";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Block embedding in iframes from other origins
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Limit referrer info sent cross-origin
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Enforce HTTPS for 2 years (production only — Vercel handles this)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Disable unused browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(), payment=(self)",
          },
          // Content Security Policy
          // Allows: self, backend API, PayOS payment page, Google Fonts, all https images
          {
            key: "Content-Security-Policy",
            value: [
              // HTML/JS/CSS only from same origin
              "default-src 'self'",
              // Scripts: self + inline (Next.js requires 'unsafe-inline' for now)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self + inline + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + data URIs + ANY https url (admin can upload images anywhere)
              `img-src 'self' data: blob: https:`,
              // API calls: self + backend
              `connect-src 'self' https://${API_DOMAIN}`,
              // Allow PayOS payment page in a redirect (not iframe)
              "frame-src 'none'",
              // Form submissions only to self
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
