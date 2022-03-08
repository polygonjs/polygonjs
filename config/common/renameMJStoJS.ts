import * as path from 'path';
import * as fs from 'fs';
import {walk} from './walk';

function MJSfilePaths(srcPath: string) {
	return walk(srcPath, () => true);
}
const srcPath = path.join(__dirname, '../../dist');
const filePaths = MJSfilePaths(srcPath);

let renamedFilesCount = 0;
for (let filePath of filePaths) {
	const basename = path.basename(filePath);
	const elements = basename.split('.');
	const firstExt = elements[1];
	if (firstExt == 'mjs') {
		const destFilePath = filePath.replace('.mjs.', '.js.').replace('.mjs', '.js');
		fs.renameSync(filePath, destFilePath);
		renamedFilesCount++;
	}
}

console.log(`renamed ${renamedFilesCount} files from .mjs to .js (since they are created as .mjs by webpack 5)`);
