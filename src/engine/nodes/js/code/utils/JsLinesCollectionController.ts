import {JsFunctionName} from '../../../utils/shaders/ShaderName';
import {
	BaseJsDefinition,
	ComputedValueJsDefinition,
	TriggerableJsDefinition,
	TriggerableJsDefinitionOptions,
	TriggeringJsDefinition,
} from '../../utils/JsDefinition';
import {JsLinesController, DefinitionTraverseCallback, AddBodyLinesOptions} from './LinesController';
import {BaseJsNodeType} from '../../_Base';
import {BaseJsShaderAssembler} from '../assemblers/_Base';
import {RegisterableVariable} from '../assemblers/_BaseJsPersistedConfigUtils';
import {JsConnectionPointType} from '../../../utils/io/connections/Js';
import {BaseNamedFunction} from '../../../../functions/_Base';
import {nodeMethodName, triggerableMethodCalls} from '../assemblers/actor/ActorAssemblerUtils';
import {EvaluatorMethodName} from '../assemblers/actor/ActorEvaluator';

export interface ComputedValueJsDefinitionData {
	dataType: JsConnectionPointType;
	varName: string;
	value: string;
}
interface TriggeringJsDefinitionOptionsExtended {
	gatherable: boolean;
	triggeringMethodName?: EvaluatorMethodName;
	nodeMethodName?: string;
}
interface TriggerableJsDefinitionOptionsExtended extends TriggerableJsDefinitionOptions {
	addTriggeredLines?: boolean;
}

export class JsLinesCollectionController {
	private _linesControllerByShaderName: Map<JsFunctionName, JsLinesController> = new Map();

	constructor(
		private _shaderNames: JsFunctionName[],
		private _currentShaderName: JsFunctionName,
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

	linesController(shaderName: JsFunctionName) {
		return this._linesControllerByShaderName.get(shaderName);
	}

	shaderNames() {
		return this._shaderNames;
	}

	setCurrentShaderName(shaderName: JsFunctionName) {
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
	addVariable(node: BaseJsNodeType, variable: RegisterableVariable, varName?: string) {
		return this.assembler().addVariable(node, variable, varName);
	}
	//
	//
	// REGISTERED FUNCTIONS
	//
	//
	addFunction(node: BaseJsNodeType, namedFunction: BaseNamedFunction) {
		return this.assembler().addFunction(node, namedFunction);
	}
	addTriggeringLines(
		node: BaseJsNodeType,
		triggeringLines: string[],
		options: TriggeringJsDefinitionOptionsExtended
	) {
		const gatherable = options?.gatherable != null ? options.gatherable : false;
		const triggeringMethodName =
			options?.triggeringMethodName != null ? options.triggeringMethodName : (node.type() as EvaluatorMethodName);

		const value = triggeringLines.join('\n');
		const varName = options.nodeMethodName || nodeMethodName(node); //.wrappedBodyLinesMethodName();
		const dataType = JsConnectionPointType.BOOLEAN; // unused
		// if (!EVALUATOR_METHOD_NAMES.includes(triggeringMethodName as EvaluatorMethodName)) {
		// 	console.warn(`method '${triggeringMethodName}' is not included`);
		// }
		this.addDefinitions(node, [
			new TriggeringJsDefinition(node, this, dataType, varName, value, {
				triggeringMethodName,
				gatherable,
				perPoint: this._assembler.perPoint(),
				nodeMethodName: options.nodeMethodName,
			}),
		]);
	}
	addTriggerableLines(
		node: BaseJsNodeType,
		triggerableLines: string[],
		options?: TriggerableJsDefinitionOptionsExtended
	) {
		const addTriggeredLines = options?.addTriggeredLines != null ? options.addTriggeredLines : true;
		if (addTriggeredLines) {
			// const currentTriggerableNodes = new Set<BaseJsNodeType>();
			// connectedTriggerableNodes({
			// 	triggeringNodes: new Set([node]),
			// 	triggerableNodes: currentTriggerableNodes,
			// 	recursive: false,
			// });
			// const triggerableMethodNames = SetUtils.toArray(currentTriggerableNodes).map((n) => nodeMethodName(n));
			// triggerableLines.push(...triggerableMethodNames.map((m) => `this.${m}()`));
			const _triggerableMethodCalls = triggerableMethodCalls(node);
			triggerableLines.push(_triggerableMethodCalls);
		}

		const value = triggerableLines.join('\n');
		const varName = node.name();
		const dataType = JsConnectionPointType.BOOLEAN; // unused
		this.addDefinitions(node, [new TriggerableJsDefinition(node, this, dataType, varName, value, options)]);
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
			this._addBodyLines(
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

	addDefinitions(node: BaseJsNodeType, definitions: BaseJsDefinition[], shaderName?: JsFunctionName) {
		if (definitions.length == 0) {
			return;
		}

		shaderName = shaderName || this._currentShaderName;
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.addDefinitions(node, definitions);
		}
	}
	definitions(shaderName: JsFunctionName, node: BaseJsNodeType) {
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			return linesController.definitions(node);
		}
	}
	traverseDefinitions(shaderName: JsFunctionName, callback: DefinitionTraverseCallback) {
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.traverseDefinitions(callback);
		}
	}
	// all_definition_nodes(shader_name: ShaderName, scene: PolyScene) {
	// 	return this._lines_controller_by_shader_name.get(shader_name)?.all_definition_nodes(scene) || [];
	// }
	// addActionBodyLines(node: BaseJsNodeType, lines: string[]) {
	// 	// if (!this._allowActionLines) {
	// 	// 	return;
	// 	// }
	// 	this.addBodyLines(node, lines);
	// }

	_addBodyLines(node: BaseJsNodeType, lines: string[], shaderName?: JsFunctionName, options?: AddBodyLinesOptions) {
		if (lines.length == 0) {
			return;
		}
		shaderName = shaderName || this._currentShaderName;
		const linesController = this._linesControllerByShaderName.get(shaderName);
		if (linesController) {
			linesController.addBodyLines(node, lines, options);
		}
	}
	bodyLines(shaderName: JsFunctionName, node: BaseJsNodeType) {
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
