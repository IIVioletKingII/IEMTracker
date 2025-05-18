import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
	base: '/IEMTracker',
	define: {
		global: {}
	},
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
					src: '404.html',
					dest: '.' // Copies to root of dist
				}
			]
		})
	],
})
