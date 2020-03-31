export class TranspiledFilter {
	static filter(transpiled_javascript: string) {
		const lines = transpiled_javascript.split('\n');
		console.log(lines);
		const filtered_lines: string[] = [];
		for (let line of lines) {
			if (!line.match(/import {.*} from '.*'/)) {
				line = line.replace('export ', 'return');
				filtered_lines.push(line);
			}
		}
		console.log('filtered_lines', filtered_lines);
		return filtered_lines.join('\n');
	}
}
