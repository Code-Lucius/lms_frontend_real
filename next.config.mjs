/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fonts are loaded via <link> in app/layout.tsx. Disable build-time font
  // inlining so the build never depends on reaching the font host.
  optimizeFonts: false,
};

export default nextConfig;
