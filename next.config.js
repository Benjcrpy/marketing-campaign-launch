const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone is for Docker/production `next build` only. Applying it during `next dev`
  // can contribute to odd `.next/server/vendor-chunks` races (ENOENT on next.js chunk).
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),
  outputFileTracingRoot: path.join(__dirname),

  /**
   * Dev: disable webpack filesystem cache entirely — fixes corrupt `.next` chunk maps
   * (`Cannot find module './331.js'`) when HMR gets out of sync.
   * Use `npm run dev` (Turbopack). Webpack path: `npm run dev:webpack`.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

module.exports = nextConfig;

