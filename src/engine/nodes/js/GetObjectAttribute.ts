/**
 * get an object attribute
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPointType,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {StringParam} from '../../params/String';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {TypeAssert} from '../../poly/Assert';

// function typedVisibleOptions(type: ParamConvertibleJsType, otherParamVal: Record<string, number | boolean> = {}) {
// 	const val = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type);
// 	return {visibleIf: {type: val, ...otherParamVal}};
// }
enum GetObjectAttributeInputName {
	attribName = 'attribName',
}
enum GetObjectAttributeOutputName {
	VALUE = 'val',
}

class GetObjectAttributeJsParamsConfig extends NodeParamsConfig {
	// attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, value) => ({name, value})),
		},
	});
	// defaultBoolean = ParamConfig.BOOLEAN(0, typedVisibleOptions(JsConnectionPointType.BOOLEAN));
	// defaultColor = ParamConfig.COLOR([0, 0, 0], typedVisibleOptions(JsConnectionPointType.COLOR));
	// defaultFloat = ParamConfig.FLOAT(0, typedVisibleOptions(JsConnectionPointType.FLOAT));
	// defaultInteger = ParamConfig.INTEGER(0, typedVisibleOptions(JsConnectionPointType.INT));
	// defaultString = ParamConfig.STRING('', typedVisibleOptions(JsConnectionPointType.STRING));
	// defaultVector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR2));
	// defaultVector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR3));
	// defaultVector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR4));
}
const ParamsConfig = new GetObjectAttributeJsParamsConfig();

export class GetObjectAttributeJsNode extends TypedJsNode<GetObjectAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GET_OBJECT_ATTRIBUTE;
	}

	override initializeNode() {
		// this.io.inputs.setNamedInputConnectionPoints([
		// 	new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		// 	new JsConnectionPoint(
		// 		GetObjectAttributeInputName.attribName,
		// 		JsConnectionPointType.STRING,
		// 		CONNECTION_OPTIONS
		// 	),
		// ]);

		// this.io.connection_points.spare_params.setInputlessParamNames([
		// 	'attribName',
		// 	'type',
		// 	'boolean',
		// 	'color',
		// 	'float',
		// 	'integer',
		// 	'vector2',
		// 	'vector3',
		// 	'vector4',
		// ]);
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputNames.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputNames.bind(this));
	}
	private _expectedInputTypes() {
		return [JsConnectionPointType.OBJECT_3D, JsConnectionPointType.STRING, this._currentConnectionType()];
	}
	private _expectedInputNames(index: number) {
		return [JsConnectionPointType.OBJECT_3D, GetObjectAttributeInputName.attribName, this.defaultValueName()][
			index
		];
	}
	private _expectedOutputTypes() {
		return [this._currentConnectionType()];
	}
	private _expectedOutputNames(index: number) {
		return [GetObjectAttributeOutputName.VALUE][index];
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		const connection_type = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connection_type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		return connection_type;
	}
	// defaultValueParam() {
	// 	const type = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type] as ParamConvertibleJsType;
	// 	switch (type) {
	// 		case JsConnectionPointType.BOOLEAN: {
	// 			return this.p.defaultBoolean;
	// 		}
	// 		case JsConnectionPointType.COLOR: {
	// 			return this.p.defaultColor;
	// 		}
	// 		case JsConnectionPointType.FLOAT: {
	// 			return this.p.defaultFloat;
	// 		}
	// 		case JsConnectionPointType.INT: {
	// 			return this.p.defaultInteger;
	// 		}
	// 		case JsConnectionPointType.STRING: {
	// 			return this.p.defaultString;
	// 		}
	// 		case JsConnectionPointType.VECTOR2: {
	// 			return this.p.defaultVector2;
	// 		}
	// 		case JsConnectionPointType.VECTOR3: {
	// 			return this.p.defaultVector3;
	// 		}
	// 		case JsConnectionPointType.VECTOR4: {
	// 			return this.p.defaultVector4;
	// 		}
	// 	}
	// 	TypeAssert.unreachable(type);
	// }
	defaultValueName(): string {
		const type = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type] as ParamConvertibleJsType;
		switch (type) {
			case JsConnectionPointType.BOOLEAN: {
				return 'defaultBoolean';
			}
			case JsConnectionPointType.COLOR: {
				return 'defaultColor';
			}
			case JsConnectionPointType.FLOAT: {
				return 'defaultFloat';
			}
			case JsConnectionPointType.INT: {
				return 'defaultInteger';
			}
			case JsConnectionPointType.STRING: {
				return 'defaultString';
			}
			case JsConnectionPointType.VECTOR2: {
				return 'defaultVector2';
			}
			case JsConnectionPointType.VECTOR3: {
				return 'defaultVector3';
			}
			case JsConnectionPointType.VECTOR4: {
				return 'defaultVector4';
			}
		}
		TypeAssert.unreachable(type);
	}
	private _nextAttribName: string = '';
	override paramDefaultValue(name: GetObjectAttributeInputName) {
		return {
			[GetObjectAttributeInputName.attribName]: this._nextAttribName,
		}[name];
	}
	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setAttribName(attribName: string) {
		const param = this.params.get(GetObjectAttributeInputName.attribName) as StringParam | undefined;
		if (param) {
			param.set(attribName);
		} else {
			this._nextAttribName = attribName;
		}
	}
	attributeName() {
		return (this.params.get(GetObjectAttributeInputName.attribName) as StringParam).value;
	}

	override setLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const attribName = this.variableForInput(linesController, GetObjectAttributeInputName.attribName);
		// const defaultParam = this.defaultValueParam();
		// const defaultValue = this.variableForInputParam(linesController, defaultParam);
		const defaultValue = this.variableForInput(linesController, this.defaultValueName());
		const out = this.jsVarName(GetObjectAttributeOutputName.VALUE);
		const dataType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];

		const func = Poly.namedFunctionsRegister.getFunction('getObjectAttribute', this, linesController);
		const bodyLine = func.asString(object3D, attribName, `'${dataType}'`, defaultValue);
		linesController.addBodyOrComputed(this, [{dataType, varName: out, value: bodyLine}]);
	}
}
