const embeddedBasePath = process.env.NOOS_EMBED_BASE_PATH || "";
const isStaticExport = process.env.NOOS_STATIC_EXPORT === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  ...(embeddedBasePath ? { basePath: embeddedBasePath, assetPrefix: embeddedBasePath } : {}),
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
