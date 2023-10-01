import {JsFunctionName} from '../../../utils/shaders/ShaderName';
import {BaseJsDefinition} from '../../utils/JsDefinition';
import {BaseJsNodeType} from '../../_Base';
import {MapUtils} from '../../../../../core/MapUtils';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';

export type DefinitionTraverseCallback = (definition: BaseJsDefinition) => void;
// export type BodyLinesTraverseCallback = (lines: string[]) => void;

export interface AddBodyLinesOptions {
	makeUniq: boolean;
}
export class JsLinesController {
	private _definitionsByNodeId: Map<CoreGraphNodeId, BaseJsDefinition[]> = new Map();
	private _bodyLinesByNodeId: Map<CoreGraphNodeId, string[]> = new Map();

	constructor(private _shader_name: JsFunctionName) {}

	get shader_name() {
		return this._shader_name;
	}

	addDefinitions(node: BaseJsNodeType, definitions: BaseJsDefinition[]) {
		this._addDefinitionsForNodeId(node.graphNodeId(), definitions);
	}
	private _addDefinitionsForNodeId(nodeId: CoreGraphNodeId, definitions: BaseJsDefinition[]) {
		for (const definition of definitions) {
			MapUtils.pushOnArrayAtEntry(this._definitionsByNodeId, nodeId, definition);
		}
	}
	definitions(node: BaseJsNodeType): BaseJsDefinition[] | undefined {
		return this._definitionsByNodeId.get(node.graphNodeId());
	}
	traverseDefinitions(callback: DefinitionTraverseCallback) {
		this._definitionsByNodeId.forEach((definitions) => {
			for (const definition of definitions) {
				callback(definition);
			}
		});
	}
	// all_definition_nodes(scene: PolyScene) {
	// 	const nodes: BaseGlNodeType[] = [];
	// 	this._definitions_by_node_id.forEach((lines, node_id) => {
	// 		const node = scene.graph.node_from_id(node_id) as BaseGlNodeType;
	// 		nodes.push(node);
	// 	});
	// 	return nodes;
	// }

	addBodyLines(node: BaseJsNodeType, lines: string[], options?: AddBodyLinesOptions) {
		this._addBodyLinesForNodeId(node.graphNodeId(), lines);
	}
	private _addBodyLinesForNodeId(nodeId: CoreGraphNodeId, lines: string[], options?: AddBodyLinesOptions) {
		let makeUniq = true;
		if (options && options.makeUniq != null) {
			makeUniq = options.makeUniq;
		}

		const linesToUsed: string[] = [];
		if (makeUniq) {
			const currentLines = this._bodyLinesByNodeId.get(nodeId);
			for (const line of lines) {
				if (currentLines) {
					if (!currentLines.includes(line)) {
						linesToUsed.push(line);
					}
				} else {
					linesToUsed.push(line);
				}
			}
		} else {
			for (const line of lines) {
				linesToUsed.push(line);
			}
		}

		for (const line of linesToUsed) {
			MapUtils.pushOnArrayAtEntry(this._bodyLinesByNodeId, nodeId, line);
		}
	}
	bodyLines(node: BaseJsNodeType): string[] | undefined {
		return this._bodyLinesByNodeId.get(node.graphNodeId());
	}
	// traverseBodyLines(callback: BodyLinesTraverseCallback) {
	// 	this._bodyLinesByNodeId.forEach((lines) => {
	// 		callback(lines);
	// 	});
	// }
	// all_body_line_nodes(scene: PolyScene) {
	// 	const nodes: BaseGlNodeType[] = [];
	// 	this._body_lines_by_node_id.forEach((lines, node_id) => {
	// 		const node = scene.graph.node_from_id(node_id) as BaseGlNodeType;
	// 		nodes.push(node);
	// 	});
	// 	return nodes;
	// }
}
