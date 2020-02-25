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
		if (add_suffix) {
			return `${LINE_PREFIXES[line_type]}${line}${LINE_SUFFIXES[line_type]}`;
		} else {
			return `${LINE_PREFIXES[line_type]}${line}`;
		}
	}
	static post_line_separator(line_type: LineType) {
		return line_type == LineType.BODY ? '	' : '';
	}
}
