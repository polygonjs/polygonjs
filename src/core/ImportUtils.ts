const _newLines: string[] = [];
export function removeImportExport(fileContent: string) {
	const lines = fileContent.split('\n');
	_newLines.length = 0;
	for (const line of lines) {
		const isImport = line.includes('import {');
		const isExport = line.includes('export {');
		if (!(isImport || isExport)) {
			_newLines.push(line);
		}
	}
	return _newLines.join('\n');
}
