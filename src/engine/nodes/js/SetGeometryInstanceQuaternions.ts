/**
 * Update the geometry instance quaternions
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

export const SetGeometryInstanceQuaternionsInputName = {
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	quaternion: 'quaternion',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstanceQuaternionsInputName.trigger,
	SetGeometryInstanceQuaternionsInputName.Object3D,
	SetGeometryInstanceQuaternionsInputName.quaternion,
	SetGeometryInstanceQuaternionsInputName.lerp,
	SetGeometryInstanceQuaternionsInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstanceQuaternionsInputName.lerp]: 1,
	[SetGeometryInstanceQuaternionsInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstanceQuaternionsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstanceQuaternionsJsParamsConfig();

export class SetGeometryInstanceQuaternionsJsNode extends TypedJsNode<SetGeometryInstanceQuaternionsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceQuaternions';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this.expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(
			(i) => [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D][i]
		);
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
	expectedInputTypes() {
		return [
			JsConnectionPointType.TRIGGER,
			JsConnectionPointType.OBJECT_3D,
			JsConnectionPointType.QUATERNION_ARRAY,
			JsConnectionPointType.FLOAT,
			JsConnectionPointType.BOOLEAN,
		];
	}
	protected _expectedOutputTypes() {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D];
	}
	protected _expectedInputName(index: number) {
		return INPUT_NAMES[index];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const quaternions = this.variableForInput(
			shadersCollectionController,
			SetGeometryInstanceQuaternionsInputName.quaternion
		);
		const lerp = this.variableForInput(shadersCollectionController, SetGeometryInstanceQuaternionsInputName.lerp);
		const attributeNeedsUpdate = this.variableForInput(
			shadersCollectionController,
			SetGeometryInstanceQuaternionsInputName.attributeNeedsUpdate
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setGeometryInstanceQuaternions',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, quaternions, lerp, attributeNeedsUpdate);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
