const _filteredLines: string[] = [];
export class TranspiledFilter {
	static filter(transpiled_javascript: string) {
		const lines = transpiled_javascript.split('\n');
		_filteredLines.length = 0;
		for (let line of lines) {
			if (!line.match(/import {.*} from '.*'/)) {
				line = line.replace('export ', 'return ');
				_filteredLines.push(line);
			}
		}
		return _filteredLines.join('\n');
	}
}
