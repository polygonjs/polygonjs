import * as fs from 'fs';
import * as path from 'path';

const tsconfigPath = path.resolve(process.cwd(), './tsconfig.json');
console.log(`tsconfigPath: ${tsconfigPath}`);

export function getTarget() {
	const tsconfig = fs.readFileSync(tsconfigPath, 'utf-8');
	const lines = tsconfig.split('\n');
	let target: string = '2020';
	for (let line of lines) {
		if (line.includes('target')) {
			const new_target = line.split(': "')[1].split(',')[0].replace('"', '');
			target = new_target.toLowerCase();
		}
	}
	// console.log('target', target);

	return target;
}
