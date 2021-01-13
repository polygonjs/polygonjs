import {BaseJsDefinition} from '../../utils/JsDefinition';
import {BaseJsNodeType} from '../../_Base';
import {MapUtils} from '../../../../../core/MapUtils';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';

export class LinesController {
	private _definitions_by_node_id: Map<CoreGraphNodeId, BaseJsDefinition[]> = new Map();
	private _body_lines_by_node_id: Map<CoreGraphNodeId, string[]> = new Map();

	constructor() {}

	add_definitions(node: BaseJsNodeType, definitions: BaseJsDefinition[]) {
		for (let definition of definitions) {
			MapUtils.push_on_array_at_entry(this._definitions_by_node_id, node.graphNodeId(), definition);
		}
	}
	definitions(node: BaseJsNodeType): BaseJsDefinition[] | undefined {
		return this._definitions_by_node_id.get(node.graphNodeId());
	}

	add_body_lines(node: BaseJsNodeType, lines: string[]) {
		for (let line of lines) {
			MapUtils.push_on_array_at_entry(this._body_lines_by_node_id, node.graphNodeId(), line);
		}
	}
	body_lines(node: BaseJsNodeType): string[] | undefined {
		return this._body_lines_by_node_id.get(node.graphNodeId());
	}
}
