import {TypedNode} from '../_Base';
// import {BaseJsFunctionAssembler} from './code/assemblers/_Base';
import {AssemblerControllerNode} from './code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
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
import {sanitizeName} from '../../../core/String';
import {BaseParamType} from '../../params/_Base';
import {EvaluatorEventData} from './code/assemblers/actor/ActorEvaluator';
import {StringParam} from '../../params/String';
import {sanitizeJsVarName} from './code/assemblers/JsTypeUtils';
import {Poly} from '../../Poly';
import {BaseJsShaderAssembler} from './code/assemblers/_Base';

export const TRIGGER_CONNECTION_NAME = 'trigger';

export interface WrappedBodyLines {
	methodNames: string[];
	wrappedLines: string;
}

function wrapComputed(varName: string): string {
	return `this.${varName}.value`;
}
export function wrapIfComputed(varName: string, linesController: JsLinesCollectionController): string {
	if (linesController.registeredAsComputed(varName)) {
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
	eventData(): EvaluatorEventData | EvaluatorEventData[] | undefined {
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

		this.addPostDirtyHook('_setMatToRecompile', this._setFunctionNodeToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setFunctionNodeToRecompile.bind(this));
	}
	override cook() {
		this.cookController.endCook();
	}

	private __setFunctionNodeToRecompileAllowed = true;
	protected _setFunctionNodeToRecompileAllowed(state: boolean) {
		this.__setFunctionNodeToRecompileAllowed = state;
	}
	protected _setFunctionNodeToRecompile() {
		if (this.__setFunctionNodeToRecompileAllowed == false) {
			return;
		}
		this.functionNode()?.assemblerController()?.setCompilationRequiredAndDirty(this);
	}
	functionNode(): AssemblerControllerNode<BaseJsShaderAssembler> | undefined {
		const parent = this.parent();
		if (parent) {
			if (parent.context() == NodeContext.JS) {
				return (parent as BaseJsNodeType)?.functionNode();
			} else {
				return parent as AssemblerControllerNode<BaseJsShaderAssembler>;
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
	inputVarName(inputName: string): string {
		return TypedJsNode.inputVarName(this, inputName);
		// const sanitizedNodePath = sanitizeName(this.path().replace(this.functionNode()?.path() || '', ''));
		// const varName = `${sanitizedNodePath}_${inputName}`;
		// return varName;
	}
	static inputVarName(node: BaseJsNodeType, inputName: string) {
		const sanitizedNodePath = sanitizeName(node.path().replace(node.functionNode()?.path() || '', ''));
		const varName = `${sanitizedNodePath}_${inputName}`;
		return varName;
	}

	variableForInputParam(
		shadersCollectionController: JsLinesCollectionController,
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
	variableForInput(shadersCollectionController: JsLinesCollectionController, inputName: string): string {
		const varName = this._variableForInput(shadersCollectionController, inputName);
		return wrapIfComputed(varName, shadersCollectionController);
	}
	private _variableForInput(shadersCollectionController: JsLinesCollectionController, inputName: string): string {
		const inputIndex = this.io.inputs.getInputIndex(inputName);
		const connection = this.io.connections.inputConnection(inputIndex);
		let outputJsVarName: string | undefined;
		if (connection) {
			const inputNode = (<unknown>connection.nodeSrc()) as BaseJsNodeType;
			const outputConnectionPoint = inputNode.io.outputs.namedOutputConnectionPoints()[connection.outputIndex()];
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
					const varName = `VAR_` + this.inputVarName(inputName);
					shadersCollectionController.addVariable(this, createVariableFromParam(param), varName);

					const _copy = (_outputJsVarName: string) => {
						return `${varName}.copy(${wrapIfComputed(_outputJsVarName, shadersCollectionController)})`;
					};
					const _set = () => {
						if (param.type() == ParamType.COLOR) {
							const func = Poly.namedFunctionsRegister.getFunction(
								'colorSetRGB',
								this,
								shadersCollectionController
							);
							const {r, g, b} = (param as ColorParam).value;
							return func.asString(varName, `${r}`, `${g}`, `${b}`);
						} else {
							return `${varName}.set(${param.value.toArray().join(', ')})`;
						}
					};

					return outputJsVarName ? _copy(outputJsVarName) : _set();
				}
			}
			return outputJsVarName || ThreeToJs.any(this.params.get(inputName)?.value);
		} else {
			if (outputJsVarName != null) {
				return outputJsVarName;
			}
			const connectionPoint = this.io.inputs.namedInputConnectionPoints()[inputIndex];
			if (!connectionPoint) {
				console.warn(
					`connectionPoint not created for index ${inputIndex} (inputName: '${inputName}', node: ${this.path()})`
				);
			}
			return outputJsVarName || connectionPoint ? ThreeToJs.any(connectionPoint.init_value) : '0';
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
	setLines(shadersCollectionController: JsLinesCollectionController) {
		// console.warn(`setLines not defined for node '${this.path()}'`);
	}
	setTriggeringLines(shadersCollectionController: JsLinesCollectionController, triggeredMethods: string): void {
		console.warn(`setTriggeringLines not defined for node '${this.path()}'`);
		// if (!this.isTriggering()) {
		// 	console.error(`node '${this.path()}' is not triggering`);
		// }
		// shadersCollectionController.addTriggeringLines(this, [triggeredMethods]);
	}
	setTriggerableLines(shadersCollectionController: JsLinesCollectionController): void {
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
