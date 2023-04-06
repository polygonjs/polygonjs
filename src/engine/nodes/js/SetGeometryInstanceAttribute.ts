/**
 * Update the geometry instance attribute
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

// import {updateInstancePositions} from './utils/JsInstance';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export const SetGeometryInstanceAttributeInputName = {
	// [JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	// [JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	values: 'values',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	// SetGeometryInstancePositionsInputName.trigger,
	// SetGeometryInstancePositionsInputName.Object3D,
	SetGeometryInstanceAttributeInputName.values,
	SetGeometryInstanceAttributeInputName.lerp,
	SetGeometryInstanceAttributeInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstanceAttributeInputName.lerp]: 1,
	[SetGeometryInstanceAttributeInputName.attributeNeedsUpdate]: true,
};
const ALLOWED_TYPES: JsConnectionPointType[] = [
	JsConnectionPointType.FLOAT_ARRAY,
	JsConnectionPointType.COLOR_ARRAY,
	JsConnectionPointType.QUATERNION_ARRAY,
	JsConnectionPointType.VECTOR2_ARRAY,
	JsConnectionPointType.VECTOR3_ARRAY,
	JsConnectionPointType.VECTOR4_ARRAY,
];

class SetGeometryInstanceAttributeJsParamsConfig extends NodeParamsConfig {
	/** @param attribute name */
	attribName = ParamConfig.STRING('');
}
const ParamsConfig = new SetGeometryInstanceAttributeJsParamsConfig();

export class SetGeometryInstanceAttributeJsNode extends TypedJsNode<SetGeometryInstanceAttributeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceAttribute';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['attribName', 'size']);

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.connection_points.set_input_name_function((i) => this._expectedInputName(i));
		this.io.connection_points.set_expected_input_types_function(() => this._expectedInputTypes());
		this.io.connection_points.set_output_name_function(
			(i) => [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D][i]
		);
		this.io.connection_points.set_expected_output_types_function(() => [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.OBJECT_3D,
		]);
	}
	private _expectedInputTypes() {
		const firstInputType = this.io.connection_points.first_input_connection_type();
		const type =
			firstInputType && ALLOWED_TYPES.includes(firstInputType)
				? firstInputType
				: JsConnectionPointType.FLOAT_ARRAY;
		return [type, JsConnectionPointType.FLOAT, JsConnectionPointType.BOOLEAN];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
	// expectedInputTypes() {
	// 	return [
	// 		JsConnectionPointType.TRIGGER,
	// 		JsConnectionPointType.OBJECT_3D,
	// 		JsConnectionPointType.VECTOR3_ARRAY,
	// 		JsConnectionPointType.FLOAT,
	// 		JsConnectionPointType.BOOLEAN,
	// 	];
	// }
	// protected _expectedOutputTypes() {
	// 	return [JsConnectionPointType.TRIGGER];
	// }
	protected _expectedInputName(index: number) {
		return INPUT_NAMES[index];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.pv.attribName;
		const values = this.variableForInput(shadersCollectionController, SetGeometryInstanceAttributeInputName.values);
		const lerp = this.variableForInput(shadersCollectionController, SetGeometryInstanceAttributeInputName.lerp);
		const attributeNeedsUpdate = this.variableForInput(
			shadersCollectionController,
			SetGeometryInstanceAttributeInputName.attributeNeedsUpdate
		);

		const functionName = this._functionName();
		const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
		const bodyLine = func.asString(object3D, attribName, values, lerp, attributeNeedsUpdate);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
	private _functionName() {
		const type = this._expectedInputTypes()[0];
		switch (type) {
			case JsConnectionPointType.FLOAT_ARRAY: {
				return 'setGeometryInstanceAttributeFloat';
			}
			case JsConnectionPointType.COLOR_ARRAY: {
				return 'setGeometryInstanceAttributeColor';
			}
			case JsConnectionPointType.QUATERNION_ARRAY: {
				return 'setGeometryInstanceAttributeQuaternion';
			}
			case JsConnectionPointType.VECTOR2_ARRAY: {
				return 'setGeometryInstanceAttributeVector2';
			}
			case JsConnectionPointType.VECTOR3_ARRAY: {
				return 'setGeometryInstanceAttributeVector3';
			}
			case JsConnectionPointType.VECTOR4_ARRAY: {
				return 'setGeometryInstanceAttributeVector4';
			}
		}

		return 'setGeometryInstanceAttributeFloat';
	}
}
