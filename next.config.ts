/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/Fennec-Animation" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/Fennec-Animation" : "",
};

export default nextConfig;
