/**
 * Returns the value previous returned by the input node
 *
 *
 */

import {TypedJsNode} from './_Base';
import {
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
	JsConnectionPointType,
	ParamConvertibleJsType,
} from '../utils/io/connections/Js';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {TypeAssert} from '../../poly/Assert';

enum PreviousValueJsNodeInputName {
	current = 'current',
	offset = 'offset',
}
const DefaultValues = {
	[PreviousValueJsNodeInputName.current]: 0,
	[PreviousValueJsNodeInputName.offset]: 1,
};

class PreviousJsParamsConfig extends NodeParamsConfig {
	offset = ParamConfig.INTEGER(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new PreviousJsParamsConfig();

export class PreviousValueJsNode extends TypedJsNode<PreviousJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'previousValue';
	}
	static readonly OUTPUT_NAME = 'prev';
	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	override paramDefaultValue(name: PreviousValueJsNodeInputName) {
		return DefaultValues[name];
	}
	protected _expectedInputTypes() {
		let firstType = this.io.connection_points.first_input_connection_type();
		if (
			firstType == null ||
			!PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.includes(firstType as ParamConvertibleJsType)
		) {
			firstType = JsConnectionPointType.FLOAT;
		}

		return [firstType, JsConnectionPointType.INT];
	}

	protected _expectedInputName(index: number): string {
		return [PreviousValueJsNodeInputName.current, PreviousValueJsNodeInputName.offset][index];
	}
	protected _expectedOutputName(index: number): string {
		return PreviousValueJsNode.OUTPUT_NAME;
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const out = this.jsVarName(PreviousValueJsNode.OUTPUT_NAME);
		const offset = this.variableForInputParam(shadersCollectionController, this.p.offset);
		const inputValue = this.variableForInput(shadersCollectionController, PreviousValueJsNodeInputName.current);

		const _func = Poly.namedFunctionsRegister.getFunction(this._functionName(), this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: this._expectedInputTypes()[0],
				varName: out,
				value: _func.asString(`'${this.path()}'`, offset, inputValue),
			},
		]);
	}
	private _functionName() {
		const type = this._expectedInputTypes()[0] as ParamConvertibleJsType;
		switch (type) {
			case JsConnectionPointType.BOOLEAN:
			case JsConnectionPointType.FLOAT:
			case JsConnectionPointType.INT:
			case JsConnectionPointType.STRING: {
				return 'previousValuePrimitive';
			}
			case JsConnectionPointType.COLOR: {
				return 'previousValueColor';
			}
			case JsConnectionPointType.VECTOR2: {
				return 'previousValueVector2';
			}
			case JsConnectionPointType.VECTOR3: {
				return 'previousValueVector3';
			}
			case JsConnectionPointType.VECTOR4: {
				return 'previousValueVector4';
			}
		}
		TypeAssert.unreachable(type);
	}
}
