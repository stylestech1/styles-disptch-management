declare module "next-svgr" {
  import type { NextConfig } from "next";

  /**
   * Wraps a Next.js config to enable SVG imports as React components.
   */
  const withSvgr: (nextConfig: NextConfig) => NextConfig;

  export default withSvgr;
}
