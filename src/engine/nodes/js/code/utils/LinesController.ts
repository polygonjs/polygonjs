import {BaseJsDefinition} from '../../utils/JsDefinition';
import {BaseJsNodeType} from '../../_Base';
import {MapUtils} from '../../../../../core/MapUtils';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';

export class JsLinesController {
	private _definitions_by_node_id: Map<CoreGraphNodeId, BaseJsDefinition[]> = new Map();
	private _body_lines_by_node_id: Map<CoreGraphNodeId, string[]> = new Map();

	constructor() {}

	addDefinitions(node: BaseJsNodeType, definitions: BaseJsDefinition[]) {
		for (let definition of definitions) {
			MapUtils.pushOnArrayAtEntry(this._definitions_by_node_id, node.graphNodeId(), definition);
		}
	}
	definitions(node: BaseJsNodeType): BaseJsDefinition[] | undefined {
		return this._definitions_by_node_id.get(node.graphNodeId());
	}

	addBodyLines(node: BaseJsNodeType, lines: string[]) {
		for (let line of lines) {
			MapUtils.pushOnArrayAtEntry(this._body_lines_by_node_id, node.graphNodeId(), line);
		}
	}
	body_lines(node: BaseJsNodeType): string[] | undefined {
		return this._body_lines_by_node_id.get(node.graphNodeId());
	}
}
