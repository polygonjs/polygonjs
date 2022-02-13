import {ShaderName} from '../../../utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {BaseGlNodeType} from '../../_Base';
import {MapUtils} from '../../../../../core/MapUtils';
import {CoreGraphNodeId} from '../../../../../core/graph/CoreGraph';

export type DefinitionTraverseCallback = (definition: BaseGLDefinition) => void;
// export type BodyLinesTraverseCallback = (lines: string[]) => void;

export interface AddBodyLinesOptions {
	makeUniq: boolean;
}
export class LinesController {
	private _definitionsByNodeId: Map<CoreGraphNodeId, BaseGLDefinition[]> = new Map();
	private _bodyLinesByNodeId: Map<CoreGraphNodeId, string[]> = new Map();

	constructor(private _shader_name: ShaderName) {}

	get shader_name() {
		return this._shader_name;
	}

	// merge(otherLinesController: LinesController) {
	// 	console.log('merge start');
	// 	otherLinesController._definitionsByNodeId.forEach((definitions, nodeId) => {
	// 		this._addDefinitionsForNodeId(nodeId, definitions);
	// 	});
	// 	otherLinesController._bodyLinesByNodeId.forEach((lines, nodeId) => {
	// 		this._addBodyLinesForNodeId(nodeId, lines);
	// 	});
	// 	console.log('merge end');
	// }

	addDefinitions(node: BaseGlNodeType, definitions: BaseGLDefinition[]) {
		this._addDefinitionsForNodeId(node.graphNodeId(), definitions);
	}
	private _addDefinitionsForNodeId(nodeId: CoreGraphNodeId, definitions: BaseGLDefinition[]) {
		for (let definition of definitions) {
			MapUtils.pushOnArrayAtEntry(this._definitionsByNodeId, nodeId, definition);
		}
	}
	definitions(node: BaseGlNodeType): BaseGLDefinition[] | undefined {
		return this._definitionsByNodeId.get(node.graphNodeId());
	}
	traverseDefinitions(callback: DefinitionTraverseCallback) {
		this._definitionsByNodeId.forEach((definitions) => {
			for (let definition of definitions) {
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

	addBodyLines(node: BaseGlNodeType, lines: string[], options?: AddBodyLinesOptions) {
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
			for (let line of lines) {
				if (currentLines) {
					if (!currentLines.includes(line)) {
						linesToUsed.push(line);
					}
				} else {
					linesToUsed.push(line);
				}
			}
		} else {
			for (let line of lines) {
				linesToUsed.push(line);
			}
		}

		for (let line of linesToUsed) {
			MapUtils.pushOnArrayAtEntry(this._bodyLinesByNodeId, nodeId, line);
		}
	}
	bodyLines(node: BaseGlNodeType): string[] | undefined {
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
