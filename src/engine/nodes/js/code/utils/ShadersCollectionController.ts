import {ShaderName} from '../../../utils/shaders/ShaderName';
import {BaseJsDefinition} from '../../utils/JsDefinition';
import {JsLinesController, DefinitionTraverseCallback, AddBodyLinesOptions} from './LinesController';
import {BaseJsNodeType} from '../../_Base';
import {RegisterableVariable, BaseJsShaderAssembler, NamedFunction} from '../assemblers/_Base';

export class ShadersCollectionController {
	private _linesControllerByShaderName: Map<ShaderName, JsLinesController> = new Map();

	constructor(
		private _shaderNames: ShaderName[],
		private _currentShaderName: ShaderName,
		private _assembler: BaseJsShaderAssembler
	) {
		for (let shaderName of this._shaderNames) {
			this._linesControllerByShaderName.set(shaderName, new JsLinesController(shaderName));
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
	//
	//
	// REGISTERED VARIABLES
	//
	//
	addVariable(node: BaseJsNodeType, varName: string, variable: RegisterableVariable) {
		return this.assembler().addVariable(node, varName, variable);
	}
	//
	//
	// REGISTERED FUNCTIONS
	//
	//
	addFunction(node: BaseJsNodeType, namedFunction: NamedFunction) {
		return this.assembler().addFunction(node, namedFunction);
	}

	//
	//
	//
	//
	//
	addDefinitions(node: BaseJsNodeType, definitions: BaseJsDefinition[], shaderName?: ShaderName) {
		if (definitions.length == 0) {
			return;
		}

		shaderName = shaderName || this._currentShaderName;
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.addDefinitions(node, definitions);
		}
	}
	definitions(shaderName: ShaderName, node: BaseJsNodeType) {
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

	addBodyLines(node: BaseJsNodeType, lines: string[], shaderName?: ShaderName, options?: AddBodyLinesOptions) {
		if (lines.length == 0) {
			return;
		}
		shaderName = shaderName || this._currentShaderName;
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.addBodyLines(node, lines, options);
		}
	}
	bodyLines(shaderName: ShaderName, node: BaseJsNodeType) {
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
