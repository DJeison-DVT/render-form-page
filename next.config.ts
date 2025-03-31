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
	webpack: (config, { isServer }) => {
		// Use the full version of Handlebars that includes the compiler.
		config.resolve.alias["handlebars"] = "handlebars/dist/handlebars.js";
		return config;
	},
};

export default nextConfig;
