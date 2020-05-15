import {BaseGlNodeType} from '../../_Base';
import {LineType} from './LineType';

const LINE_SUFFIXES = {
	[LineType.FUNCTION_DECLARATION]: '',
	[LineType.DEFINE]: ';',
	[LineType.BODY]: ';',
};

const LINE_PREFIXES = {
	[LineType.FUNCTION_DECLARATION]: '',
	[LineType.DEFINE]: '',
	[LineType.BODY]: '	',
};

export class CodeFormatter {
	static node_comment(node: BaseGlNodeType, line_type: LineType): string {
		let line = `// ${node.full_path()}`;
		if (line_type == LineType.BODY) {
			line = `	${line}`;
		}
		return line;
	}
	static line_wrap(line: string, line_type: LineType) {
		let add_suffix = true;
		if (line.indexOf('#if') == 0 || line.indexOf('#endif') == 0) {
			add_suffix = false;
		}
		line = `${LINE_PREFIXES[line_type]}${line}`;
		if (add_suffix) {
			const last_char = line[line.length - 1];
			const suffix = LINE_SUFFIXES[line_type];
			if (last_char != suffix) {
				line += suffix;
			}
		}
		return line;
	}
	static post_line_separator(line_type: LineType) {
		return line_type == LineType.BODY ? '	' : '';
	}
}
