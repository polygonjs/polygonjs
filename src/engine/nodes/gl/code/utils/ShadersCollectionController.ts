import {ShaderName} from '../../../utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {LinesController, DefinitionTraverseCallback, AddBodyLinesOptions} from './LinesController';
import {BaseGlNodeType} from '../../_Base';
import {TypedAssembler} from '../../../utils/shaders/BaseAssembler';
import {NodeContext} from '../../../../poly/NodeContext';

export class ShadersCollectionController {
	private _linesControllerByShaderName: Map<ShaderName, LinesController> = new Map();

	constructor(
		private _shaderNames: ShaderName[],
		private _currentShaderName: ShaderName,
		private _assembler: TypedAssembler<NodeContext.GL>
	) {
		for (let shaderName of this._shaderNames) {
			this._linesControllerByShaderName.set(shaderName, new LinesController(shaderName));
		}
	}

	// mergeDefinitions(shadersCollectionController: ShadersCollectionController) {
	// 	for (let shaderName of this._shaderNames) {
	// 		// this._linesControllerByShaderName.set(shaderName, new LinesController(shaderName));
	// 		shadersCollectionController.traverseDefinitions(shaderName, (definition: BaseGLDefinition) => {
	// 			this.addDefinitions(definition.node, [definition], shaderName);
	// 			console.log('add', definition.node, definition);
	// 		});
	// 	}
	// }

	assembler() {
		return this._assembler;
	}

	linesController(shaderName: ShaderName) {
		return this._linesControllerByShaderName.get(shaderName);
	}

	shaderNames() {
		return this._shaderNames;
	}

	setCurrentShaderName(shaderName: ShaderName) {
		this._currentShaderName = shaderName;
	}
	currentShaderName() {
		return this._currentShaderName;
	}

	addDefinitions(node: BaseGlNodeType, definitions: BaseGLDefinition[], shaderName?: ShaderName) {
		if (definitions.length == 0) {
			return;
		}

		shaderName = shaderName || this._currentShaderName;
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.addDefinitions(node, definitions);
		}
	}
	definitions(shaderName: ShaderName, node: BaseGlNodeType) {
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			return linesController.definitions(node);
		}
	}
	traverseDefinitions(shaderName: ShaderName, callback: DefinitionTraverseCallback) {
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.traverseDefinitions(callback);
		}
	}
	// all_definition_nodes(shader_name: ShaderName, scene: PolyScene) {
	// 	return this._lines_controller_by_shader_name.get(shader_name)?.all_definition_nodes(scene) || [];
	// }

	addBodyLines(node: BaseGlNodeType, lines: string[], shaderName?: ShaderName, options?: AddBodyLinesOptions) {
		if (lines.length == 0) {
			return;
		}
		shaderName = shaderName || this._currentShaderName;
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.addBodyLines(node, lines, options);
		}
	}
	bodyLines(shaderName: ShaderName, node: BaseGlNodeType) {
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			return linesController.bodyLines(node);
		}
	}
	// traverseBodyLines(shaderName: ShaderName, callback: BodyLinesTraverseCallback) {
	// 	const lines_controller = this._linesControllerByShaderName.get(shaderName);
	// 	if (lines_controller) {
	// 		return lines_controller.traverseBodyLines(callback);
	// 	}
	// }
	// all_body_line_nodes(shader_name: ShaderName, scene: PolyScene) {
	// 	return this._lines_controller_by_shader_name.get(shader_name)?.all_body_line_nodes(scene) || [];
	// }
}
