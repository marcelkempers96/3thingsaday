const repoName = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? '';
const explicitBase = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const inferredBase = process.env.GITHUB_ACTIONS === 'true' && repoName && !repoName.endsWith('.github.io') ? `/${repoName}` : '';
const basePath = explicitBase || inferredBase || '';

const nextConfig = {
	reactStrictMode: true,
	experimental: {
		typedRoutes: true
	},
	// Enable static HTML export for GitHub Pages
	output: 'export',
	trailingSlash: true,
	// Use a base path when deploying under /<repo>
	...(basePath ? { basePath } : {}),
	env: {
		NEXT_PUBLIC_BASE_PATH: basePath
	}
};

export default nextConfig;