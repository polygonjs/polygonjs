/**
 * Updates the param of specific node
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {TypeAssert} from '../../poly/Assert';
import {ParamPathParam} from '../../params/ParamPath';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {inputParam} from './_BaseObject3D';
import {BaseParamType} from '../../params/_Base';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum SetParamJsNodeInputName {
	lerp = 'lerp',
	val = 'val',
}

interface SetParamOptions {
	controller: JsLinesCollectionController;
	param: string;
	// paramName: string;
	paramValue: string;
	lerp: string;
}

class SetParamJsParamsConfig extends NodeParamsConfig {
	/** @param type of the parameter to update */
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new SetParamJsParamsConfig();

export class SetParamJsNode extends TypedJsNode<SetParamJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_PARAM;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.PARAM, JsConnectionPointType.PARAM, CONNECTION_OPTIONS),
			new JsConnectionPoint<JsConnectionPointType.FLOAT>(
				SetParamJsNodeInputName.lerp,
				JsConnectionPointType.FLOAT,
				{
					...CONNECTION_OPTIONS,
					init_value: 1,
				}
			),
		]);

		this.io.connection_points.set_input_name_function(() => SetParamJsNodeInputName.val);
		this.io.connection_points.set_expected_input_types_function(() => [this._currentConnectionType()]);
		this.io.connection_points.set_output_name_function(() => TRIGGER_CONNECTION_NAME);
		this.io.connection_points.set_expected_output_types_function(() => [JsConnectionPointType.TRIGGER]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} type not valid`);
		}
		return connectionType || JsConnectionPointType.FLOAT;
	}
	setParamType(paramType: ParamConvertibleJsType) {
		const index = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(paramType);
		if (index < 0) {
			console.warn(
				`only the following types are accepted: ${PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.join(', ')}`
			);
			return;
		}
		this.p.type.set(index);
	}
	setParamPath(paramPath: string) {
		(this.params.get(JsConnectionPointType.PARAM) as ParamPathParam).set(paramPath);
	}
	setParamParam(param: BaseParamType) {
		(this.params.get(JsConnectionPointType.PARAM) as ParamPathParam).setParam(param);
	}
	override setTriggerableLines(controller: JsLinesCollectionController) {
		const param = inputParam(this, controller);
		const paramValue = this.variableForInput(controller, SetParamJsNodeInputName.val);
		const lerp = this.variableForInput(controller, SetParamJsNodeInputName.lerp);

		const bodyLine = this._bodyLine({
			controller,
			param,
			paramValue,
			lerp,
		});
		if (!bodyLine) {
			return;
		}

		controller.addTriggerableLines(this, [bodyLine]);
	}
	private _bodyLine(options: SetParamOptions): string | undefined {
		const type = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		switch (type) {
			case JsConnectionPointType.BOOLEAN: {
				return this._setBoolean(options);
			}
			case JsConnectionPointType.COLOR: {
				return this._setColor(options);
			}
			case JsConnectionPointType.FLOAT: {
				return this._setFloat(options);
			}
			case JsConnectionPointType.INT: {
				return this._setInt(options);
			}
			case JsConnectionPointType.STRING: {
				return this._setString(options);
			}
			case JsConnectionPointType.VECTOR2: {
				return this._setVector2(options);
			}
			case JsConnectionPointType.VECTOR3: {
				return this._setVector3(options);
			}
			case JsConnectionPointType.VECTOR4: {
				return this._setVector4(options);
			}
		}
		TypeAssert.unreachable(type);
	}
	private _setBoolean(options: SetParamOptions): string {
		const {controller, param, paramValue} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamBoolean', this, controller);
		return func.asString(param, paramValue);
	}
	private _setColor(options: SetParamOptions): string {
		const {controller, param, paramValue, lerp} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamColor', this, controller);
		return func.asString(param, paramValue, lerp);
	}
	private _setFloat(options: SetParamOptions): string {
		const {controller, param, paramValue, lerp} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamFloat', this, controller);
		return func.asString(param, paramValue, lerp);
	}
	private _setInt(options: SetParamOptions): string {
		const {controller, param, paramValue, lerp} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamInteger', this, controller);
		return func.asString(param, paramValue, lerp);
	}
	private _setString(options: SetParamOptions): string {
		const {controller, param, paramValue} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamString', this, controller);
		return func.asString(param, paramValue);
	}
	private _setVector2(options: SetParamOptions): string {
		const {controller, param, paramValue, lerp} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamVector2', this, controller);
		return func.asString(param, paramValue, lerp);
	}
	private _setVector3(options: SetParamOptions): string {
		const {controller, param, paramValue, lerp} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamVector3', this, controller);
		return func.asString(param, paramValue, lerp);
	}
	private _setVector4(options: SetParamOptions): string {
		const {controller, param, paramValue, lerp} = options;
		const func = Poly.namedFunctionsRegister.getFunction('setParamVector4', this, controller);
		return func.asString(param, paramValue, lerp);
	}
}
