import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	experimental: {
		serverActions: {
			bodySizeLimit: "8mb",
		},
	},
};

export default nextConfig;
