import * as path from 'path';
const currentPath = path.resolve(__dirname, '../../..');
const nodeModulesPath = path.resolve(currentPath, 'node_modules');
// const threePath = path.resolve(currentPath, 'node_modules/three');
// const threeSrcPath = path.resolve(currentPath, 'node_modules/three/src');

// https://esbuild.github.io/plugins/#on-resolve
interface OnResolveArgs {
	path: string;
}
export const threeImportMapsOnResolvePlugin = {
	name: 'example',
	setup(build: any) {
		// Redirect all paths starting with "images/" to "./public/images/"
		build.onResolve({filter: /^three\/src/}, (args: OnResolveArgs) => {
			const elements = args.path.split('.');
			const ext = elements[elements.length - 1];
			let newPath = path.join(nodeModulesPath, `${args.path}`);
			if (ext != 'js') {
				newPath = `${newPath}.js`;
			}
			if (ext == 'html') {
				return {path: newPath, external: true};
			}
			return {path: newPath};
		});

		//   // Mark all paths starting with "http://" or "https://" as external
		//   build.onResolve({ filter: /^https?:\/\// }, (args:any) => {
		// 	return { path: args.path, external: true }
		//   })
	},
};
