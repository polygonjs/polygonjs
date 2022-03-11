import * as fs from 'fs';
import * as path from 'path';

import {polygonjsRoot} from './common';

const filePath = path.join(polygonjsRoot, `public/bundled_types.d.ts`);
const REG_SINGLE_QUOTES = /import\(\'three\'\)\./g;
const REG_DOUBLE_QUOTES = /import\(\"three\"\)\./g;

function removeThreeImports() {
	const content = fs.readFileSync(filePath, 'utf-8');
	//- remove occurences of import("three").
	const lines = content.split('\n');
	const newLines: string[] = [];
	for (let line of lines) {
		line = line.replace(REG_SINGLE_QUOTES, '').replace(REG_DOUBLE_QUOTES, '');
		newLines.push(line);
	}
	fs.writeFileSync(filePath, newLines.join('\n'));
}

function replaceMTLLoaderDeclaration() {
	const content = fs.readFileSync(filePath, 'utf-8');
	//- remove occurences of import("three").
	const lines = content.split('\n');
	const newLines: string[] = [];
	for (let line of lines) {
		if (line.includes('class MTLLoader extends')) {
			line = line.replace('class MTLLoader extends', 'class MTLLoader_not_needed extends');
		}
		newLines.push(line);
	}
	fs.writeFileSync(filePath, newLines.join('\n'));
}

removeThreeImports();
replaceMTLLoaderDeclaration();
