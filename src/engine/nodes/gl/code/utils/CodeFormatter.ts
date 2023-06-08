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
	static nodeComment(node: BaseGlNodeType, lineType: LineType): string {
		let line = `// ${node.path()}`;
		let prefix: string = LINE_PREFIXES[lineType];
		if (lineType == LineType.BODY) {
			let distance = this.nodeDistanceToMaterial(node);
			// special case for subnet_output, so that the comment is offset correctly
			if (node.type() == NetworkChildNodeType.OUTPUT) {
				distance += 1;
			}
			prefix = prefix.repeat(distance);
		}
		if (lineType == LineType.BODY) {
			line = `${prefix}${line}`;
		}
		return line;
	}
	static lineWrap(node: BaseGlNodeType, line: string, lineType: LineType) {
		let add_suffix = true;
		if (
			line.includes('#if') ||
			line.includes('#else') ||
			line.includes('#endif') ||
			line.includes('#pragma unroll_loop_')
		) {
			add_suffix = false;
		}
		let prefix: string = LINE_PREFIXES[lineType];
		if (lineType == LineType.BODY) {
			prefix = prefix.repeat(this.nodeDistanceToMaterial(node));
		}
		line = `${prefix}${line}`;
		if (add_suffix) {
			const last_char = line[line.length - 1];
			const suffix = LINE_SUFFIXES[lineType];
			const lineIsEmpty = line.trim().length == 0;
			const lineIsComment = line.trim().startsWith('//');
			if (
				last_char != suffix &&
				last_char != BLOCK_START_LAST_CHAR &&
				last_char != BLOCK_END_LAST_CHAR &&
				!lineIsEmpty &&
				!lineIsComment
			) {
				line += suffix;
			}
		}
		return line;
	}
	static post_line_separator(lineType: LineType) {
		return lineType == LineType.BODY ? '	' : '';
	}

	static nodeDistanceToMaterial(node: BaseNodeType): number {
		const parent = node.parent();
		if (!parent) {
			return 0;
		}
		if (parent.context() != node.context()) {
			return 1;
		} else {
			return 1 + this.nodeDistanceToMaterial(parent);
			// we do not have an offset of 1 for subnet_input and subnet_output
			// so that those nodes can control the tabs themselves in setLines()
			// let offset = 1;
			// if (node.type() == NetworkChildNodeType.INPUT || node.type() == NetworkChildNodeType.OUTPUT) {
			// 	offset = 0;
			// }
			// return offset + this.node_distance_to_material(parent);
		}
	}
}
