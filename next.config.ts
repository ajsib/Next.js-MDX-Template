import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from 'remark-gfm';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = withMDX({
  // MDX and default config
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  devIndicators: false
});

export default nextConfig;
