const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone is for Docker/production `next build` only. Applying it during `next dev`
  // can contribute to odd `.next/server/vendor-chunks` races (ENOENT on next.js chunk).
  ...(process.env.NODE_ENV === "production" ? { output: "standalone" } : {}),
  outputFileTracingRoot: path.join(__dirname)
};

module.exports = nextConfig;

