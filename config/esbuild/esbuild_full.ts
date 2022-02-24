import {build} from 'esbuild';
import {srcPath, getOptions} from './utils/common';
import {fix_glsl_files} from './utils/glsl';

async function start() {
	const options = getOptions();
	console.log('options', options);
	try {
		await build(options);
	} catch (err) {
		console.error('ERROR');
		// console.log(err);
		process.exit(1);
	}
	fix_glsl_files(srcPath);
}

start();
