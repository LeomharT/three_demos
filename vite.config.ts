import mdx from '@mdx-js/rollup';
import basicSSL from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// https://vite.dev/config/
export default defineConfig({
	plugins: [react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }), mdx(), basicSSL()],
	server: {
		hmr: false,
		host: '0.0.0.0',
		https: true,
		cors: true,
	},
	resolve: {
		alias: {
			'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
		},
	},
});
