import * as path from 'path';
import * as fs from 'fs';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';

import {FUNCTION_NAME_BY_FILE_NAME} from './FunctionsDict';
import {FUNCTION_TEMPLATE_BY_FUNCTION_NAME} from './FunctionsTemplateTypes';

const ALL_REGISTER_FILE_PATH = 'src/engine/poly/registers/functions/All.ts';
const FUNCTIONS_FOLDER_PATH = 'src/engine/functions';

function formatJs(JSContent: string) {
	try {
		return prettier.format(JSContent, {
			parser: 'babel',
			plugins: [parserBabel],
			printWidth: 120,
		});
	} catch (err) {
		console.log(err);
		return `JSContent`;
	}
}

const PRINT = true;
const PERFORM = true;
function createFileForFunction(functionName: string, originalFileName: string) {
	const fileContent = formatJs(`import { ${functionName} } from './_${originalFileName}'
	export { ${functionName} }
	`);
	const filePath = path.join(FUNCTIONS_FOLDER_PATH, `${functionName}.ts`);
	if (PRINT) {
		console.log(`write ${filePath}`);
	}
	if (PERFORM) {
		fs.writeFileSync(filePath, fileContent, 'utf-8');
	}
}

interface Lines {
	names: Set<string>;
	import: string[];
	type: string[];
	register: string[];
}
function createFunctionsRegisterAll() {
	const fileLines: Lines = {
		names: new Set(),
		import: [],
		type: [],
		register: [],
	};
	const originalFileNames: string[] = Object.keys(FUNCTION_NAME_BY_FILE_NAME);
	// const originalFilePaths = originalFileNames.map(fileName=>path.join( FUNCTIONS_FOLDER_PATH, `_${fileName}` ))

	for (const originalFileName of originalFileNames) {
		const functionNames = FUNCTION_NAME_BY_FILE_NAME[originalFileName];
		for (const functionName of functionNames) {
			createFileForFunction(functionName, originalFileName);

			const templateElement = FUNCTION_TEMPLATE_BY_FUNCTION_NAME[functionName];
			const functionNameWithTemplate =
				templateElement != null ? `${functionName}<${templateElement}>` : functionName;

			const importLine = `import { ${functionName} } from '../../../functions/${functionName}'`;
			const typeLine = ` ${functionName}:${functionNameWithTemplate} `;
			if (fileLines.names.has(functionName)) {
				throw `${functionName} already listed`;
			}
			fileLines.names.add(functionName);
			fileLines.import.push(importLine);
			fileLines.type.push(typeLine);
			fileLines.register.push(functionName);
		}
	}
	// sort
	const _sort = (a: string, b: string) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1);
	fileLines.import = fileLines.import.sort(_sort);
	fileLines.type = fileLines.type.sort(_sort);
	fileLines.register = fileLines.register.sort(_sort);

	// create file content
	const fileContent = formatJs(`
import type {PolyEngine} from '../../../Poly';
import type {Color, Vector2, Vector3, Vector4} from 'three';
import type {PrimitiveArrayElement, VectorArrayElement} from '../../../nodes/utils/io/connections/Js';
import type { MathArrayVectorElement } from '../../../functions/_MathGeneric';
//

${fileLines.import.join(';\n')}

export interface NamedFunctionMap {
	${fileLines.type.join(';\n')}
}

export class AllNamedFunctionRegister {
	static run(poly: PolyEngine) {
		[
			${fileLines.register.join(',\n')}
		].forEach((f) => poly.registerNamedFunction(f));
	}
}`);
	const filePath = ALL_REGISTER_FILE_PATH;
	if (PRINT) {
		console.log(`write ${filePath}`);
		// console.log(fileContent);
	}
	if (PERFORM) {
		fs.writeFileSync(filePath, fileContent, 'utf-8');
	}
	console.log(`functions count: ${fileLines.type.length}`);
}

createFunctionsRegisterAll();
