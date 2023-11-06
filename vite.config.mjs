import {defineConfig} from 'vite';
import vitePluginString from 'vite-plugin-string';

const POLYGONJS_VERSION = JSON.stringify(require('./package.json').version);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vitePluginString({compress: false})],
	build: {
		rollupOptions: {
			external: (id) => {
				console.log(id);
				return id.startsWith('dist/');
			},
		},
	},
	define: {
		__POLYGONJS_VERSION__: POLYGONJS_VERSION,
	},
});
