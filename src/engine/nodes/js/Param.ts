/**
 * Creates a param on the container node, which allows to control the js function without recompiling it
 *
 *
 */
import {TypedJsNode} from './_Base';
import {
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
	// GlConnectionPoint,
	JsConnectionPointType,
	JsConnectionPointInitValueMap,
	JsConnectionPointTypeToParamTypeMap,
	ParamConvertibleJsType,
} from '../utils/io/connections/Js';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {ParamType} from '../../poly/ParamType';
// import {UniformJsDefinition} from './utils/JsDefinition';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsParamConfig} from './code/utils/JsParamConfig';
import {Poly} from '../../Poly';
// import {ComputedValueJsDefinition} from './utils/JsDefinition';
// import {CoreType} from '../../../core/Type';
// import {isBooleanTrue} from '../../../core/BooleanValue';
class ParamJsParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new ParamJsParamsConfig();

export class ParamJsNode extends TypedJsNode<ParamJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'param';
	}
	// protected _allow_inputs_created_from_params: boolean = false;
	// static readonly UNIFORM_NAME = 'paramVal';
	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.addPostDirtyHook('_setFunctionNodeToRecompile', this._setFunctionNodeToRecompile.bind(this));
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_output_name_function((index: number) => ParamJsNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [
			PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type],
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const out = this.jsVarName(ParamJsNode.OUTPUT_NAME);

		const _func = Poly.namedFunctionsRegister.getFunction(
			'getActorNodeParamValue',
			this,
			shadersCollectionController
		);
		// shadersCollectionController.addDefinitions(this, [
		// 	new ComputedValueJsDefinition(
		// 		this,
		// 		shadersCollectionController,
		// 		JsConnectionPointType.RAY,
		// 		out,
		// 		_func.asString(`'${this.pv.name}'`)
		// 	),
		// ]);

		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type],
				varName: out,
				value: _func.asString(`'${this.pv.name}'`),
			},
		]);

		// const definitions = [];
		// const bodyLines: string[] = [];
		// const type = JS_CONNECTION_POINT_TYPES[this.pv.type];
		// const varName = this.uniformName();
		// const out = this.jsVarName(ParamJsNode.OUTPUT_NAME);
		// // definitions.push(new UniformJsDefinition(this, type, varName));
		// // lines_controller.addDefinitions(this, definitions);
		// if (
		// 	[
		// 		JsConnectionPointType.COLOR,
		// 		JsConnectionPointType.VEC2,
		// 		JsConnectionPointType.VEC3,
		// 		JsConnectionPointType.VEC4,
		// 	].includes(type)
		// ) {
		// } else {
		// 	// if (param.components) {
		// 	// 	// bodyLines.push(varName);
		// 	// 	if (variableFromParamRequired(param)) {
		// 	// 		shadersCollectionController.addVariable(this, out, createVariableFromParam(param));
		// 	// 	}
		// 	// 	bodyLines.push(`${out}.copy(${varName})`);
		// 	// } else {
		// 	// shadersCollectionController.addVariable(this, out, createVariableFromParam(param));
		// 	bodyLines.push(`const ${out} = ${varName}`);
		// 	// }
		// }
		// shadersCollectionController.addBodyLines(this, bodyLines);
	}
	override setParamConfigs() {
		const type = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		const defaultValue = JsConnectionPointInitValueMap[type];
		const paramType = JsConnectionPointTypeToParamTypeMap[type];

		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		// if (
		// 	param_type == ParamType.VECTOR3 &&
		// 	isBooleanTrue(this.p.asColor.value) &&
		// 	isArray(default_value) &&
		// 	default_value.length == 3
		// ) {
		// 	const param_config = new JsParamConfig(ParamType.COLOR, this.pv.name, default_value, this.uniformName());
		// 	this._param_configs_controller.push(param_config);
		// } else {
		const param_config = new JsParamConfig(paramType, this.pv.name, defaultValue, this.uniformName());
		this._param_configs_controller.push(param_config);
		// }
	}
	uniformName() {
		return this.jsVarName(ParamJsNode.OUTPUT_NAME);
		// const output_connection_point = this.io.outputs.namedOutputConnectionPoints()[0];
		// const varName = this.jsVarName(output_connection_point.name());
		// return varName;
	}
	setJsType(type: ParamConvertibleJsType) {
		const index = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type);
		this.p.type.set(index);
	}
	override paramsGenerating() {
		return true;
	}
}
