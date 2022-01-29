import {ShaderName} from '../../../utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {LinesController, DefinitionTraverseCallback} from './LinesController';
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

	assembler() {
		return this._assembler;
	}

	// merge(otherShadersCollectionController: ShadersCollectionController) {
	// 	for (let shaderName of this._shaderNames) {
	// 		const otherLinesController = otherShadersCollectionController.linesController(shaderName);
	// 		const linesController = this._linesControllerByShaderName.get(shaderName);
	// 		if (linesController && otherLinesController) {
	// 			linesController.merge(otherLinesController);
	// 		}
	// 	}
	// }
	linesController(shaderName: ShaderName) {
		return this._linesControllerByShaderName.get(shaderName);
	}

	shaderNames() {
		return this._shaderNames;
	}

	set_current_shader_name(shaderName: ShaderName) {
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
		const lines_controller = this._linesControllerByShaderName.get(shaderName);
		if (lines_controller) {
			lines_controller.addDefinitions(node, definitions);
		}
	}
	definitions(shader_name: ShaderName, node: BaseGlNodeType) {
		const lines_controller = this._linesControllerByShaderName.get(shader_name);
		if (lines_controller) {
			return lines_controller.definitions(node);
		}
	}
	traverseDefinitions(shaderName: ShaderName, callback: DefinitionTraverseCallback) {
		const lines_controller = this._linesControllerByShaderName.get(shaderName);
		if (lines_controller) {
			lines_controller.traverseDefinitions(callback);
		}
	}
	// all_definition_nodes(shader_name: ShaderName, scene: PolyScene) {
	// 	return this._lines_controller_by_shader_name.get(shader_name)?.all_definition_nodes(scene) || [];
	// }

	addBodyLines(node: BaseGlNodeType, lines: string[], shaderName?: ShaderName) {
		if (lines.length == 0) {
			return;
		}
		shaderName = shaderName || this._currentShaderName;
		const lines_controller = this._linesControllerByShaderName.get(shaderName);
		if (lines_controller) {
			lines_controller.addBodyLines(node, lines);
		}
	}
	body_lines(shaderName: ShaderName, node: BaseGlNodeType) {
		const lines_controller = this._linesControllerByShaderName.get(shaderName);
		if (lines_controller) {
			return lines_controller.body_lines(node);
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
