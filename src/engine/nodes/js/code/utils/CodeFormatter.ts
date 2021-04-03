import {BaseJsNodeType} from '../../_Base';
import {JsLineType} from './LineType';

const LINE_SUFFIXES = {
	[JsLineType.FUNCTION_DECLARATION]: '',
	[JsLineType.DEFINE]: ';',
	[JsLineType.BODY]: ';',
};

const LINE_PREFIXES = {
	[JsLineType.FUNCTION_DECLARATION]: '',
	[JsLineType.DEFINE]: '',
	[JsLineType.BODY]: '	',
};

export class JsCodeFormatter {
	static node_comment(node: BaseJsNodeType, line_type: JsLineType): string {
		let line = `// ${node.path()}`;
		if (line_type == JsLineType.BODY) {
			line = `	${line}`;
		}
		return line;
	}
	static line_wrap(line: string, line_type: JsLineType) {
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
	static post_line_separator(line_type: JsLineType) {
		return line_type == JsLineType.BODY ? '	' : '';
	}
}
