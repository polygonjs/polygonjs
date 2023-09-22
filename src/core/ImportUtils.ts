export function removeImportExport(fileContent: string) {
	const lines = fileContent.split('\n');
	const newLines: string[] = [];
	for (const line of lines) {
		const isImport = line.includes('import {');
		const isExport = line.includes('export {');
		if (!(isImport || isExport)) {
			newLines.push(line);
		}
	}
	return newLines.join('\n');
}
