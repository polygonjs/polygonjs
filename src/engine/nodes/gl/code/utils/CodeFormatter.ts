import {BaseGlNodeType} from '../../_Base';
import {LineType} from './LineType';
import {BaseNodeType} from '../../../_Base';
import {NetworkChildNodeType} from '../../../../poly/NodeContext';

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
const BLOCK_START_LAST_CHAR = '{';
const BLOCK_END_LAST_CHAR = '}';

export class CodeFormatter {
	static node_comment(node: BaseGlNodeType, line_type: LineType): string {
		let line = `// ${node.full_path()}`;
		let prefix: string = LINE_PREFIXES[line_type];
		if (line_type == LineType.BODY) {
			let distance = this.node_distance_to_material(node);
			// special case for subnet_output, so that the comment is offset correctly
			if (node.type == NetworkChildNodeType.OUTPUT) {
				distance += 1;
			}
			prefix = prefix.repeat(distance);
		}
		if (line_type == LineType.BODY) {
			line = `${prefix}${line}`;
		}
		return line;
	}
	static line_wrap(node: BaseGlNodeType, line: string, line_type: LineType) {
		let add_suffix = true;
		if (line.indexOf('#if') == 0 || line.indexOf('#endif') == 0) {
			add_suffix = false;
		}
		let prefix: string = LINE_PREFIXES[line_type];
		if (line_type == LineType.BODY) {
			prefix = prefix.repeat(this.node_distance_to_material(node));
		}
		line = `${prefix}${line}`;
		if (add_suffix) {
			const last_char = line[line.length - 1];
			const suffix = LINE_SUFFIXES[line_type];
			if (last_char != suffix && last_char != BLOCK_START_LAST_CHAR && last_char != BLOCK_END_LAST_CHAR) {
				line += suffix;
			}
		}
		return line;
	}
	static post_line_separator(line_type: LineType) {
		return line_type == LineType.BODY ? '	' : '';
	}

	static node_distance_to_material(node: BaseNodeType): number {
		if (!node.parent) {
			return 0;
		}
		if (node.parent.node_context() != node.node_context()) {
			return 1;
		} else {
			// we do not have an offset of 1 for subnet_input and subnet_output
			// so that those nodes can control the tabs themselves in set_lines()
			let offset = 1;
			if (node.type == NetworkChildNodeType.INPUT || node.type == NetworkChildNodeType.OUTPUT) {
				offset = 0;
			}
			return offset + this.node_distance_to_material(node.parent);
		}
	}
}
