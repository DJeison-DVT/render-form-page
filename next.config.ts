import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	experimental: {
		serverActions: {
			bodySizeLimit: "32mb",
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.googleapis.com",
			},
		],
	},
};

export default nextConfig;
