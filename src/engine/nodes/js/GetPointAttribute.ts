/**
 * get a point attribute
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D, inputPointIndex} from './_BaseObject3D';
import {TypedJsNode} from './_Base';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {StringParam} from '../../params/String';
import {TypeAssert} from '../../poly/Assert';
import {GetPointPropertyJsNodeInputName} from '../../../core/reactivity/PointPropertyReactivity';
import {Vector2, Vector3, Vector4} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

type AvailableType =
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.INT
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;
export const AVAILABLE_TYPES: Array<AvailableType> = [
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
function typedVisibleOptions(type: AvailableType, otherParamVal: Record<string, number | boolean> = {}) {
	const val = AVAILABLE_TYPES.indexOf(type);
	return {visibleIf: {type: val, ...otherParamVal}};
}
enum GetPointAttributeInputName {
	attribName = 'attribName',
}
enum GetPointAttributeOutputName {
	VALUE = 'val',
}

class GetObjectAttributeJsParamsConfig extends NodeParamsConfig {
	// attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(AVAILABLE_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: AVAILABLE_TYPES.map((name, value) => ({name, value})),
		},
	});
	defaultFloat = ParamConfig.FLOAT(0, typedVisibleOptions(JsConnectionPointType.FLOAT));
	defaultInteger = ParamConfig.INTEGER(0, typedVisibleOptions(JsConnectionPointType.INT));
	defaultVector2 = ParamConfig.VECTOR2([0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR2));
	defaultVector3 = ParamConfig.VECTOR3([0, 0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR3));
	defaultVector4 = ParamConfig.VECTOR4([0, 0, 0, 0], typedVisibleOptions(JsConnectionPointType.VECTOR4));
}
const ParamsConfig = new GetObjectAttributeJsParamsConfig();

export class GetPointAttributeJsNode extends TypedJsNode<GetObjectAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GET_POINT_ATTRIBUTE;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(GetPointPropertyJsNodeInputName.ptnum, JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				GetPointAttributeInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [
			JsConnectionPointType.INT,
			this._currentConnectionType(),
		]);
		this.io.connection_points.set_output_name_function(
			(index: number) => [GetPointPropertyJsNodeInputName.ptnum, GetPointAttributeOutputName.VALUE][index]
		);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		const type = this.attribType();
		if (type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		return type;
	}
	defaultValueParam() {
		const type = this.attribType();
		switch (type) {
			case JsConnectionPointType.FLOAT: {
				return this.p.defaultFloat;
			}
			case JsConnectionPointType.INT: {
				return this.p.defaultInteger;
			}
			case JsConnectionPointType.VECTOR2: {
				return this.p.defaultVector2;
			}
			case JsConnectionPointType.VECTOR3: {
				return this.p.defaultVector3;
			}
			case JsConnectionPointType.VECTOR4: {
				return this.p.defaultVector4;
			}
		}
		TypeAssert.unreachable(type);
	}
	private _bodyLine(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);
		const attribName = this.variableForInput(linesController, GetPointAttributeInputName.attribName);
		const defaultParam = this.defaultValueParam();
		const defaultValue = this.variableForInputParam(linesController, defaultParam);
		//
		const type = this.attribType();
		switch (type) {
			case JsConnectionPointType.FLOAT:
			case JsConnectionPointType.INT: {
				const func = Poly.namedFunctionsRegister.getFunction('getPointAttributeNumber', this, linesController);
				return func.asString(object3D, ptnum, attribName, defaultValue);
			}
			case JsConnectionPointType.VECTOR2:
			case JsConnectionPointType.VECTOR3:
			case JsConnectionPointType.VECTOR4: {
				const functionName =
					type == JsConnectionPointType.VECTOR2
						? 'getPointAttributeVector2'
						: type == JsConnectionPointType.VECTOR3
						? 'getPointAttributeVector3'
						: 'getPointAttributeVector4';
				const tmpVar =
					type == JsConnectionPointType.VECTOR2
						? new Vector2()
						: type == JsConnectionPointType.VECTOR3
						? new Vector3()
						: new Vector4();
				const tmpVarName = linesController.addVariable(this, tmpVar);
				const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
				return func.asString(object3D, ptnum, attribName, defaultValue, tmpVarName);
			}
		}
		TypeAssert.unreachable(type);
	}
	private _nextAttribName: string = '';
	override paramDefaultValue(name: GetPointAttributeInputName) {
		return {
			[GetPointAttributeInputName.attribName]: this._nextAttribName,
		}[name];
	}
	setAttribType(type: AvailableType) {
		this.p.type.set(AVAILABLE_TYPES.indexOf(type));
	}
	attribType() {
		const type = AVAILABLE_TYPES[this.pv.type];
		return type;
	}
	setAttribName(attribName: string) {
		const param = this.params.get(GetPointAttributeInputName.attribName) as StringParam | undefined;
		if (param) {
			param.set(attribName);
		} else {
			this._nextAttribName = attribName;
		}
	}
	attributeName() {
		return (this.params.get(GetPointAttributeInputName.attribName) as StringParam).value;
	}

	override setLines(linesController: JsLinesCollectionController) {
		const out = this.jsVarName(GetPointAttributeOutputName.VALUE);
		const dataType = AVAILABLE_TYPES[this.pv.type];

		const bodyLine = this._bodyLine(linesController);
		linesController.addBodyOrComputed(this, [{dataType, varName: out, value: bodyLine}]);
	}
}
