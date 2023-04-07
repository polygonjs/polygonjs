import {ShaderName} from '../../../utils/shaders/ShaderName';
import {
	BaseJsDefinition,
	ComputedValueJsDefinition,
	TriggerableJsDefinition,
	TriggeringJsDefinition,
} from '../../utils/JsDefinition';
import {JsLinesController, DefinitionTraverseCallback, AddBodyLinesOptions} from './LinesController';
import {BaseJsNodeType} from '../../_Base';
import {BaseJsShaderAssembler} from '../assemblers/_Base';
import {RegisterableVariable} from '../assemblers/_BaseJsPersistedConfigUtils';
import {JsConnectionPointType} from '../../../utils/io/connections/Js';
import {BaseNamedFunction} from '../../../../functions/_Base';
import {connectedTriggerableNodes, nodeMethodName} from '../assemblers/actor/ActorAssemblerUtils';
import {SetUtils} from '../../../../../core/SetUtils';

export interface ComputedValueJsDefinitionData {
	dataType: JsConnectionPointType;
	varName: string;
	value: string;
}

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

	// private _allowActionLines = false;
	// withAllowActionLines(callback: () => void) {
	// 	this._allowActionLines = true;
	// 	callback();
	// 	this._allowActionLines = false;
	// }

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
	addFunction(node: BaseJsNodeType, namedFunction: BaseNamedFunction) {
		return this.assembler().addFunction(node, namedFunction);
	}
	addTriggeringLines(node: BaseJsNodeType, triggeringLines: string[]) {
		const value = triggeringLines.join('\n');
		const varName = node.wrappedBodyLinesMethodName();
		const dataType = JsConnectionPointType.BOOLEAN; // unused
		this.addDefinitions(node, [new TriggeringJsDefinition(node, this, dataType, varName, value)]);
	}
	addTriggerableLines(node: BaseJsNodeType, triggerableLines: string[]) {
		const currentTriggerableNodes = new Set<BaseJsNodeType>();
		connectedTriggerableNodes({
			triggeringNodes: new Set([node]),
			triggerableNodes: currentTriggerableNodes,
			recursive: false,
		});
		const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) => nodeMethodName(n));
		triggerableLines.push(...triggerableMethodNames.map((m) => `this.${m}()`));

		const value = triggerableLines.join('\n');
		const varName = node.name();
		const dataType = JsConnectionPointType.BOOLEAN; // unused
		this.addDefinitions(node, [new TriggerableJsDefinition(node, this, dataType, varName, value)]);
	}

	//
	//
	//
	//
	//

	addComputedVarName(varName: string) {
		this._assembler.addComputedVarName(varName);
	}
	registeredAsComputed(varName: string): boolean {
		return this._assembler.registeredAsComputed(varName);
	}
	addBodyOrComputed(node: BaseJsNodeType, linesData: ComputedValueJsDefinitionData[]) {
		if (this._assembler.computedVariablesAllowed()) {
			this.addComputed(node, linesData);
		} else {
			this.addBodyLines(
				node,
				linesData.map((lineData) => {
					const {varName, value} = lineData;
					const bodyLine = `const ${varName} = ${value}`;
					return bodyLine;
				})
			);
		}
	}
	addComputed(node: BaseJsNodeType, linesData: ComputedValueJsDefinitionData[]) {
		this.addDefinitions(
			node,
			linesData.map((lineData) => {
				const {dataType, varName, value} = lineData;
				return new ComputedValueJsDefinition(node, this, dataType, varName, value);
			})
		);
	}

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
	addActionBodyLines(node: BaseJsNodeType, lines: string[]) {
		// if (!this._allowActionLines) {
		// 	return;
		// }
		this.addBodyLines(node, lines);
	}

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
