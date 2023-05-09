import * as fs from 'fs';
import * as path from 'path';

import {polygonjsRoot} from './common';

const filePath = path.join(polygonjsRoot, `public/bundled_types.d.ts`);
// const REG_SINGLE_QUOTES = /import\(\'three\'\)\./g;
// const REG_DOUBLE_QUOTES = /import\(\"three\"\)\./g;

import {ERRORS_DETECTED} from './errors_detected';

const errorRegex = /(\d+),(\d+)/;
function erroredLineNumbers() {
	const lines = ERRORS_DETECTED.split('\n');
	const lineNumbers: number[] = [];
	for (const line of lines) {
		const match = line.match(errorRegex);
		if (match) {
			const lineNumber = parseInt(match[1]);
			// const columnNumber = match[2];
			lineNumbers.push(lineNumber);
		}
	}
	return lineNumbers;
}

// function removeThreeImports() {
// 	const content = fs.readFileSync(filePath, 'utf-8');
// 	//- remove occurences of import("three").
// 	const lines = content.split('\n');
// 	const newLines: string[] = [];
// 	for (let line of lines) {
// 		line = line.replace(REG_SINGLE_QUOTES, '').replace(REG_DOUBLE_QUOTES, '');
// 		newLines.push(line);
// 	}
// 	fs.writeFileSync(filePath, newLines.join('\n'));
// }

function removeThreePrefix() {
	const content = fs.readFileSync(filePath, 'utf-8');
	//- remove occurences of import("three").
	const lines = content.split('\n');
	const newLines: string[] = [];
	for (let line of lines) {
		line = line.replace('THREE.', '');
		newLines.push(line);
	}
	fs.writeFileSync(filePath, newLines.join('\n'));
}
function removeJsepPrefix() {
	const content = fs.readFileSync(filePath, 'utf-8');
	//- remove occurences of import("three").
	const lines = content.split('\n');
	const newLines: string[] = [];
	for (let line of lines) {
		line = line.replace('jsep.', '');
		newLines.push(line);
	}
	fs.writeFileSync(filePath, newLines.join('\n'));
}

// function replaceMTLLoaderDeclaration() {
// 	const content = fs.readFileSync(filePath, 'utf-8');
// 	//- remove occurences of import("three").
// 	const lines = content.split('\n');
// 	const newLines: string[] = [];
// 	for (let line of lines) {
// 		if (line.includes('class MTLLoader extends')) {
// 			line = line.replace('class MTLLoader extends', 'class MTLLoader_not_needed extends');
// 		}
// 		newLines.push(line);
// 	}
// 	fs.writeFileSync(filePath, newLines.join('\n'));
// }

function removeExportPrefix() {
	const WORDS = ['class', 'type', 'interface', 'const', 'declare']; //.map(p=>`declare ${p}`)
	function fixLine(line: string) {
		for (const word of WORDS) {
			line = line.replace(`export ${word}`, word);
		}
		// also remove last export
		if (line.includes('export {};')) {
			return '';
		}
		return line;
	}

	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const newLines: string[] = [];

	for (let line of lines) {
		newLines.push(fixLine(line));
	}

	fs.writeFileSync(filePath, newLines.join('\n'));
}
function addTSIgnoreBeforeDetectedErrors() {
	const lineNumbers = erroredLineNumbers();
	const linesNumbersSet = new Set(lineNumbers);
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const newLines: string[] = [];
	let i = 1; // line count starts at 1
	for (let line of lines) {
		if (linesNumbersSet.has(i)) {
			newLines.push(`// @ts-ignore`);
			console.log(i, line);
		}
		newLines.push(line);
		i++;
	}
	fs.writeFileSync(filePath, newLines.join('\n'));
}

addTSIgnoreBeforeDetectedErrors();
removeThreePrefix();
removeJsepPrefix();
removeExportPrefix();
// removeThreeImports();
// replaceMTLLoaderDeclaration();
