import {defineConfig} from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
	host: 'localhost',
	assetsInclude: ['**/*.html'],
	plugins: [glsl()],
});
