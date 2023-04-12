/**
 * Creates a constant
 *
 *
 */
import {TypedJsNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
// import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {CoreType} from '../../../core/Type';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {JsConnectionPointType, JS_CONNECTION_TYPES_FOR_CONSTANT} from '../utils/io/connections/Js';
import {ConstantJsDefinition} from './utils/JsDefinition';

function typedVisibleOptions(type: JsConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
	const val = JS_CONNECTION_TYPES_FOR_CONSTANT.indexOf(type);
	return {visibleIf: {type: val, ...otherParamVal}};
}

class ConstantJsParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(JS_CONNECTION_TYPES_FOR_CONSTANT.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: JS_CONNECTION_TYPES_FOR_CONSTANT.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	boolean = ParamConfig.BOOLEAN(0, typedVisibleOptions(JsConnectionPointType.BOOLEAN));
	color = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(JsConnectionPointType.COLOR));
	float = ParamConfig.FLOAT(0, typedVisibleOptions(JsConnectionPointType.FLOAT));
	int = ParamConfig.INTEGER(0, typedVisibleOptions(JsConnectionPointType.INT));
	string = ParamConfig.STRING('', typedVisibleOptions(JsConnectionPointType.STRING));
	vector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR2));
	vector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR3));
	vector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR4));
}
const ParamsConfig = new ConstantJsParamsConfig();
export class ConstantJsNode extends TypedJsNode<ConstantJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'constant';
	}
	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.connection_points.set_output_name_function((index: number) => ConstantJsNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const param = this.currentParam();
		if (!param) {
			console.warn(`no param found for constant node for type '${this.pv.type}'`);
			return;
		}
		const value = this.currentValue();
		if (value == null) {
			console.warn(`no value found for constant node for type '${this.pv.type}'`);
			return;
		}

		const out = this._currentVarName();
		const varName = this.variableForInputParam(shadersCollectionController, param);

		shadersCollectionController.addDefinitions(this, [
			new ConstantJsDefinition(this, shadersCollectionController, this._currentConnectionType(), out, varName),
		]);
	}

	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn('constant gl node type is null', this.path());
		}
		const connectionType = JS_CONNECTION_TYPES_FOR_CONSTANT[this.pv.type] || JsConnectionPointType.FLOAT;
		if (connectionType == null) {
			console.warn(`constant gl node type if not valid (${this.pv.type})`, this.path());
		}
		return connectionType;
	}

	currentParam() {
		const type = JS_CONNECTION_TYPES_FOR_CONSTANT[this.pv.type];
		switch (type) {
			case JsConnectionPointType.BOOLEAN: {
				return this.p.boolean;
			}
			case JsConnectionPointType.COLOR: {
				return this.p.color;
			}
			case JsConnectionPointType.FLOAT: {
				return this.p.float;
			}
			case JsConnectionPointType.INT: {
				return this.p.int;
			}
			case JsConnectionPointType.STRING: {
				return this.p.string;
			}
			case JsConnectionPointType.VECTOR2: {
				return this.p.vector2;
			}
			case JsConnectionPointType.VECTOR3: {
				return this.p.vector3;
			}
			case JsConnectionPointType.VECTOR4: {
				return this.p.vector4;
			}
		}
		console.warn(`constant with type '${type}' not yet implemented`);
		// we should never run this
		return this.p.boolean;
	}
	private _currentVarName(): string {
		return this.jsVarName(ConstantJsNode.OUTPUT_NAME);
	}
	currentValue() {
		const param = this.currentParam();
		if (param) {
			let value = ThreeToGl.any(param.value);
			// ensure that it is an integer when needed
			// as ThreeToGl.any can only detect if this is a number for now
			// and therefore does not make the distinction between float and int
			if (param.name() == this.p.int.name() && CoreType.isNumber(param.value)) {
				value = ThreeToGl.integer(param.value);
			}
			return value;
		}
	}

	setJsType(type: JsConnectionPointType) {
		this.p.type.set(JS_CONNECTION_TYPES_FOR_CONSTANT.indexOf(type));
	}
}
