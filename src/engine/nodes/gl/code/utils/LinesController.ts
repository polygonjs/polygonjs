import {ShaderName} from '../../../utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {BaseGlNodeType} from '../../_Base';
import {MapUtils} from '../../../../../core/MapUtils';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';

export class LinesController {
	private _definitions_by_node_id: Map<CoreGraphNodeId, BaseGLDefinition[]> = new Map();
	private _body_lines_by_node_id: Map<CoreGraphNodeId, string[]> = new Map();

	constructor(private _shader_name: ShaderName) {}

	get shader_name() {
		return this._shader_name;
	}

	addDefinitions(node: BaseGlNodeType, definitions: BaseGLDefinition[]) {
		for (let definition of definitions) {
			MapUtils.pushOnArrayAtEntry(this._definitions_by_node_id, node.graphNodeId(), definition);
		}
	}
	definitions(node: BaseGlNodeType): BaseGLDefinition[] | undefined {
		return this._definitions_by_node_id.get(node.graphNodeId());
	}
	// all_definition_nodes(scene: PolyScene) {
	// 	const nodes: BaseGlNodeType[] = [];
	// 	this._definitions_by_node_id.forEach((lines, node_id) => {
	// 		const node = scene.graph.node_from_id(node_id) as BaseGlNodeType;
	// 		nodes.push(node);
	// 	});
	// 	return nodes;
	// }

	addBodyLines(node: BaseGlNodeType, lines: string[]) {
		for (let line of lines) {
			MapUtils.pushOnArrayAtEntry(this._body_lines_by_node_id, node.graphNodeId(), line);
		}
	}
	body_lines(node: BaseGlNodeType): string[] | undefined {
		return this._body_lines_by_node_id.get(node.graphNodeId());
	}
	// all_body_line_nodes(scene: PolyScene) {
	// 	const nodes: BaseGlNodeType[] = [];
	// 	this._body_lines_by_node_id.forEach((lines, node_id) => {
	// 		const node = scene.graph.node_from_id(node_id) as BaseGlNodeType;
	// 		nodes.push(node);
	// 	});
	// 	return nodes;
	// }
}
