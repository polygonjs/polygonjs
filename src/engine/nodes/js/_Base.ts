import {TypedNode} from '../_Base';
// import {BaseJsFunctionAssembler} from './code/assemblers/_Base';
import {AssemblerControllerNode} from './code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {ParamInitValueSerialized} from '../../params/types/ParamInitValueSerialized';
import {JsParamConfig} from './code/utils/JsParamConfig';
import {ParamType} from '../../poly/ParamType';
// import {BaseGlConnectionPoint} from '../utils/io/connections/Gl';
// import {IOController} from '../utils/io/IOController';
import {IntegerParam} from '../../params/Integer';
import {FloatParam} from '../../params/Float';
import {Vector2Param} from '../../params/Vector2';
import {Vector3Param} from '../../params/Vector3';
import {Vector4Param} from '../../params/Vector4';
import {ColorParam} from '../../params/Color';
import {BooleanParam} from '../../params/Boolean';
import {ThreeToJs} from '../../../core/ThreeToJs';
import {ParamsEditableStateController} from '../utils/io/ParamsEditableStateController';
import {Color, Quaternion, Vector2, Vector3, Vector4} from 'three';
import {CoreString} from '../../../core/String';
import {BaseParamType} from '../../params/_Base';
import {EvaluatorEventData} from './code/assemblers/actor/Evaluator';
import {StringParam} from '../../params/String';
import {sanitizeJsVarName} from './code/assemblers/JsTypeUtils';

export const TRIGGER_CONNECTION_NAME = 'trigger';

export interface WrappedBodyLines {
	methodNames: string[];
	wrappedLines: string;
}

function wrapComputed(varName: string): string {
	return `this.${varName}.value`;
}
function wrapIfComputed(varName: string, shadersCollectionController: ShadersCollectionController): string {
	if (shadersCollectionController.registeredAsComputed(varName)) {
		return wrapComputed(varName);
	} else {
		return varName;
	}
}

export function variableFromParamRequired(
	param: BaseParamType
): param is ColorParam | Vector2Param | Vector3Param | Vector4Param {
	return (
		param instanceof ColorParam ||
		param instanceof Vector2Param ||
		param instanceof Vector3Param ||
		param instanceof Vector4Param
	);
}
export function createVariableFromParam(param: ColorParam | Vector2Param | Vector3Param | Vector4Param) {
	if (param instanceof ColorParam) {
		return new Color();
	}
	if (param instanceof Vector2Param) {
		return new Vector2();
	}
	if (param instanceof Vector3Param) {
		return new Vector3();
	}
	if (param instanceof Vector4Param) {
		if (param.options.asQuaternion()) {
			return new Quaternion();
		} else {
			return new Vector4();
		}
	}
	return new Vector4();
}
export class TypedJsNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.JS, K> {
	static override context(): NodeContext {
		return NodeContext.JS;
	}

	protected _param_configs_controller: ParamConfigsController<JsParamConfig<ParamType>> | undefined;
	// protected _assembler: BaseJsFunctionAssembler | undefined;
	private _paramsEditableStatesController = new ParamsEditableStateController(this);
	eventData(): EvaluatorEventData | Array<EvaluatorEventData> | undefined {
		return undefined;
	}
	isTriggering() {
		return false;
	}

	override initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		this.io.connections.initInputs();

		this.io.connection_points.spare_params.initializeNode();
		this._paramsEditableStatesController.initializeNode();

		// TODO: only trigger a recompile
		// if the current node has a trigger input?
		this.addPostDirtyHook('_setMatToRecompile', this._setFunctionNodeToRecompile.bind(this));
	}
	override cook() {
		console.warn('js node cooking', this.path());
		this.cookController.endCook();
	}

	protected _setFunctionNodeToRecompile() {
		this.functionNode()?.assemblerController()?.setCompilationRequiredAndDirty(this);
	}
	functionNode(): AssemblerControllerNode | undefined {
		const parent = this.parent();
		if (parent) {
			if (parent.context() == NodeContext.JS) {
				return (parent as BaseJsNodeType)?.functionNode();
			} else {
				return parent as AssemblerControllerNode;
			}
		}
	}

	// //
	// //
	// // VARIABLES
	// //
	// //
	jsVarName(name: string) {
		return sanitizeJsVarName(`v_POLY_${this.name()}_${name}`);
	}
	inputVarName(inputName: string) {
		const sanitizedNodePath = CoreString.sanitizeName(this.path().replace(this.functionNode()?.path() || '', ''));
		const varName = `${sanitizedNodePath}_${inputName}`;
		return varName;
	}

	variableForInputParam(
		shadersCollectionController: ShadersCollectionController,
		param:
			| IntegerParam
			| FloatParam
			| Vector2Param
			| Vector3Param
			| Vector4Param
			| ColorParam
			| BooleanParam
			| StringParam
	) {
		return this.variableForInput(shadersCollectionController, param.name());
	}
	variableForInput(shadersCollectionController: ShadersCollectionController, inputName: string): string {
		const varName = this._variableForInput(shadersCollectionController, inputName);
		return wrapIfComputed(varName, shadersCollectionController);
	}
	private _variableForInput(shadersCollectionController: ShadersCollectionController, inputName: string): string {
		const inputIndex = this.io.inputs.getInputIndex(inputName);
		const connection = this.io.connections.inputConnection(inputIndex);
		let outputJsVarName: string | undefined;
		if (connection) {
			const inputNode = (<unknown>connection.node_src) as BaseJsNodeType;
			const outputConnectionPoint = inputNode.io.outputs.namedOutputConnectionPoints()[connection.output_index];
			if (outputConnectionPoint) {
				const outputName = outputConnectionPoint.name();
				outputJsVarName = inputNode.jsVarName(outputName);
				// console.log({outputJsVarName});
				// return outputJsVarName;
			} else {
				console.warn(`no output called '${inputName}' for js node ${inputNode.path()}`);
				throw 'variable_for_input ERROR';
			}
		}

		if (this.params.has(inputName)) {
			const param = this.params.get(inputName);
			if (param) {
				if (param.type() == ParamType.STRING) {
					return outputJsVarName != null ? outputJsVarName : `'${param.value}'`;
				}
				if (variableFromParamRequired(param)) {
					const varName = this.inputVarName(inputName);
					shadersCollectionController.addVariable(this, varName, createVariableFromParam(param));

					return outputJsVarName
						? `${varName}.copy(${wrapIfComputed(outputJsVarName, shadersCollectionController)})`
						: `${varName}.set(${param.value.toArray().join(', ')})`;
				}
			}
			return outputJsVarName || ThreeToJs.any(this.params.get(inputName)?.value);
		} else {
			const connectionPoint = this.io.inputs.namedInputConnectionPoints()[inputIndex];
			return outputJsVarName || ThreeToJs.any(connectionPoint.init_value);
		}
	}

	// variableForInput(name: string): string {
	// 	const input_index = this.io.inputs.getInputIndex(name);
	// 	const connection = this.io.connections.inputConnection(input_index);
	// 	if (connection) {
	// 		const input_node = (<unknown>connection.node_src) as BaseJsNodeType;
	// 		const output_connection_point =
	// 			input_node.io.outputs.namedOutputConnectionPoints()[connection.output_index];
	// 		if (output_connection_point) {
	// 			const output_name = output_connection_point.name();
	// 			return input_node.js_var_name(output_name);
	// 		} else {
	// 			console.warn(`no output called '${name}' for gl node ${input_node.path()}`);
	// 			throw 'variable_for_input ERROR';
	// 		}
	// 	} else {
	// 		return 'to debug...'; //ThreeToGl.any(this.params.get(name)?.value);
	// 	}
	// }

	// //
	// //
	// // ADDED LINES
	// //
	// //
	setLines(shadersCollectionController: ShadersCollectionController) {
		// console.warn(`setLines not defined for node '${this.path()}'`);
	}
	setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string): void {
		console.warn(`setTriggeringLines not defined for node '${this.path()}'`);
		// if (!this.isTriggering()) {
		// 	console.error(`node '${this.path()}' is not triggering`);
		// }
		// shadersCollectionController.addTriggeringLines(this, [triggeredMethods]);
	}
	setTriggerableLines(shadersCollectionController: ShadersCollectionController): void {
		// console.warn(`setLines not defined for node '${this.path()}'`);
	}
	// addConstructorInitFunctionLines(shadersCollectionController: ShadersCollectionController): void {}
	// wrappedBodyLinesMethodName() {
	// 	return this.type();
	// }
	// wrappedBodyLines(
	// 	shadersCollectionController: ShadersCollectionController,
	// 	bodyLines: string[],
	// 	existingMethodNames: Set<string>
	// ): WrappedBodyLines | undefined {
	// 	const methodName = this.wrappedBodyLinesMethodName();
	// 	if (existingMethodNames.has(methodName)) {
	// 		return;
	// 	}
	// 	const wrappedLines = `${methodName}(){
	// 		${bodyLines.join('\n')}
	// 	}`;
	// 	return {
	// 		methodNames: [methodName],
	// 		wrappedLines,
	// 	};
	// }

	reset_code() {
		this._param_configs_controller?.reset();
		// this.resetLines();
	}

	// //
	// //
	// // PARAM CONFIGS
	// //
	// //
	paramsGenerating() {
		return false;
	}
	public setParamConfigs() {}
	param_configs() {
		return this._param_configs_controller?.list();
	}

	// //
	// //
	// // INPUT
	// //
	// //
	// js_input_default_value(name: string): ParamInitValueSerialized {
	// 	return null;
	// }
}

export type BaseJsNodeType = TypedJsNode<NodeParamsConfig>;
export class BaseJsNodeClass extends TypedJsNode<NodeParamsConfig> {}

class ParamlessJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new ParamlessJsParamsConfig();
export class ParamlessTypedJsNode extends TypedJsNode<ParamlessJsParamsConfig> {
	override paramsConfig = ParamsConfig;
}
