/**
 * Update a point attribute
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {
	inputObject3D,
	inputPointIndex,
	vector3OutputFromInput,
	floatOutputFromInput,
	integerOutputFromInput,
	setObject3DOutputLine,
} from './_BaseObject3D';
import {
	JS_CONNECTION_POINT_IN_NODE_DEF,
	JsConnectionPoint,
	JsConnectionPointType,
	PointAttributeJsType,
	POINT_ATTRIBUTE_JS_CONNECTION_POINT_TYPES,
} from '../utils/io/connections/Js';
import {TypedJsNode} from './_Base';
import {TypeAssert} from '../../poly/Assert';
import {StringParam} from '../../params/String';

export enum SetPointAttributeInputName {
	ptnum = 'ptnum',
	attribName = 'attribName',
	lerp = 'lerp',
	val = 'val',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetPointAttributeJsParamsConfig extends NodeParamsConfig {
	/** @param attribute type */
	type = ParamConfig.INTEGER(POINT_ATTRIBUTE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: POINT_ATTRIBUTE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param attribName */
	attribName = ParamConfig.STRING('');
	/** @param point index */
	ptnum = ParamConfig.INTEGER(0);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPointAttributeJsParamsConfig();

export class SetPointAttributeJsNode extends TypedJsNode<SetPointAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_POINT_ATTRIBUTE;
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(SetPointAttributeInputName.ptnum, JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				SetPointAttributeInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint<JsConnectionPointType.FLOAT>('lerp', JsConnectionPointType.FLOAT, {
				...CONNECTION_OPTIONS,
				init_value: 1,
			}),
		]);

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputType.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	private _expectedInputType() {
		return [this._currentConnectionType()];
	}
	private _expectedOutputTypes() {
		return [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.OBJECT_3D,
			JsConnectionPointType.INT,
			JsConnectionPointType.STRING,
			JsConnectionPointType.FLOAT,
			this._currentConnectionType(),
		];
	}
	private _expectedInputName(index: number) {
		return SetPointAttributeInputName.val;
	}
	private _expectedOutputName(index: number) {
		return [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.OBJECT_3D,
			SetPointAttributeInputName.ptnum,
			SetPointAttributeInputName.attribName,
			SetPointAttributeInputName.lerp,
			SetPointAttributeInputName.val,
		][index];
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		const connectionType = POINT_ATTRIBUTE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} js node type not valid`);
		}
		return connectionType || JsConnectionPointType.FLOAT;
	}
	setAttribType(type: PointAttributeJsType) {
		this.p.type.set(POINT_ATTRIBUTE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setAttribName(attribName: string) {
		(this.params.get(SetPointAttributeInputName.attribName)! as StringParam).set(attribName);
	}

	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);

		integerOutputFromInput(this, SetPointAttributeInputName.ptnum, linesController);
		vector3OutputFromInput(this, SetPointAttributeInputName.attribName, linesController);
		floatOutputFromInput(this, SetPointAttributeInputName.lerp, linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);
		const attribName = this.variableForInput(linesController, SetPointAttributeInputName.attribName);
		const lerp = this.variableForInput(linesController, SetPointAttributeInputName.lerp);
		const newValue = this.variableForInput(linesController, SetPointAttributeInputName.val);

		const functionName = this._functionName();
		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
		const bodyLine = func.asString(object3D, attribName, ptnum, newValue, lerp);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
	private _functionName() {
		const type = this._currentConnectionType();
		switch (type) {
			case JsConnectionPointType.INT:
			case JsConnectionPointType.FLOAT:
				return 'setPointAttributeNumber';
			case JsConnectionPointType.COLOR:
				return 'setPointAttributeColor';
			case JsConnectionPointType.VECTOR2:
				return 'setPointAttributeVector2';
			case JsConnectionPointType.VECTOR3:
				return 'setPointAttributeVector3';
			case JsConnectionPointType.VECTOR4:
				return 'setPointAttributeVector4';
		}
		TypeAssert.unreachable(type);
	}
}
