import * as fs from 'fs';
import {walk} from '../../common/walk';

export function fix_glsl_files(srcPath: string) {
	// then we rename the glsl files that have been transpile from bla.glsl to bla.js into bla.glsl.js:
	const glsl_files = find_glsl_files(srcPath);
	const current_path = process.cwd();
	for (let glsl_file of glsl_files) {
		const short_path_glsl = glsl_file.replace(`${current_path}/`, '');
		const short_path_no_ext = short_path_glsl.replace(`.glsl`, '');
		const short_path_js = `${short_path_no_ext}.js`;
		const dest_path_js = `dist/${short_path_js}`;
		const new_dest_path = `dist/${short_path_no_ext}.glsl.js`;
		// console.log(dest_path_js);
		if (fs.existsSync(dest_path_js)) {
			fs.renameSync(dest_path_js, new_dest_path);

			// replace `module.exports = ` by `export default `
			const content = fs.readFileSync(new_dest_path, 'utf-8').replace(`module.exports = `, `export default `);
			fs.writeFileSync(new_dest_path, content);
		} else {
			console.error(`!!! ${dest_path_js} not found`);
		}
	}
}

function is_glsl(file_path: string) {
	const elements = file_path.split('.');
	const short_ext = elements[elements.length - 1];
	return short_ext == 'glsl';
}

function find_glsl_files(srcPath: string) {
	return walk(srcPath, is_glsl);
}
