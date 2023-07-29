const fs = require('fs');
const path = require('path');

function processFilePath(fileShortPath) {
	const filePath = path.join(__dirname, fileShortPath) + '.ts';
	const depth = fileShortPath.split('/').length - 1;
	const upFolder = '../'.repeat(depth - 1);
	const importLine = `import type {QUnit} from '${upFolder}helpers/QUnit';`;
	const functionName =
		'test' +
		fileShortPath
			.split('/')
			.filter((e) => e.length > 1)
			.join('')
			.replace('.ts', '');
	const wrapStart = `export function ${functionName}(qUnit: QUnit) {`;
	const wrapEnd = `}`;
	const importStatement = `import {${functionName}} from '${fileShortPath}';`;
	const data = {importStatement, functionName};

	const fileContent = fs.readFileSync(filePath, 'utf8');
	const lines = fileContent.split('\n');

	let i = 0;
	let lastImportIndex = -1;
	for (const line of lines) {
		if (line.includes(`from '`)) {
			lastImportIndex = i;
		}
		i++;
	}
	lines.splice(lastImportIndex + 1, 0, wrapStart);

	if (lines[0].includes('importLine')) {
		return data;
		// lines.unshift(importLine);
	}
	lines.unshift(importLine);
	lines.push(wrapEnd);

	i = 0;
	for (const line of lines) {
		const newLine = line.replace('QUnit.', 'qUnit.');
		lines[i] = newLine;
		i++;
	}

	fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

	return data;
}

async function main() {
	const inputFilePath = path.join(__dirname, 'tests.backup.ts');
	const outputFilePath = path.join(__dirname, 'tests.ts');
	const testsContent = fs.readFileSync(inputFilePath, 'utf8');
	const lines = testsContent.split('\n');
	let filePaths = [];
	for (const line of lines) {
		if (line.includes('import')) {
			const elements = line.split(`'`);
			const filePath = elements[1];
			if (!filePaths.includes(filePath)) {
				filePaths.push(filePath);
			}
			// console.log(filePath);
		}
	}
	// while (filePaths.length > 10) {
	// 	filePaths.pop();
	// }
	// filePaths = filePaths.filter((p) => p.includes('sop/Switch'));
	// console.log(filePaths);

	const results = filePaths.map(processFilePath);
	const importStatements = results.map((e) => e.importStatement);
	const functionNames = results.map((e) => e.functionName);

	const newLines = [
		importStatements.join(`\n`),
		`export function testPolygonjs(qUnit:QUnit) {`,
		functionNames.map((f) => `${f}(qUnit)`).join(`\n`),
		`}`,
	];
	// console.log(importStatements.join(`\n`));
	fs.writeFileSync(outputFilePath, newLines.join('\n'), 'utf8');
}

main();
