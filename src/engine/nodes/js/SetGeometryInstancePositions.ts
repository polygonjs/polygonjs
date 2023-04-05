/**
 * Update the geometry instance positions
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

export const SetGeometryInstancePositionsInputName = {
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	position: 'position',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstancePositionsInputName.trigger,
	SetGeometryInstancePositionsInputName.Object3D,
	SetGeometryInstancePositionsInputName.position,
	SetGeometryInstancePositionsInputName.lerp,
	SetGeometryInstancePositionsInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstancePositionsInputName.lerp]: 1,
	[SetGeometryInstancePositionsInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstancePositionsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstancePositionsJsParamsConfig();

export class SetGeometryInstancePositionsJsNode extends TypedJsNode<SetGeometryInstancePositionsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstancePositions';
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
			JsConnectionPointType.VECTOR3_ARRAY,
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
		const positions = this.variableForInput(
			shadersCollectionController,
			SetGeometryInstancePositionsInputName.position
		);
		const lerp = this.variableForInput(shadersCollectionController, SetGeometryInstancePositionsInputName.lerp);
		const attributeNeedsUpdate = this.variableForInput(
			shadersCollectionController,
			SetGeometryInstancePositionsInputName.attributeNeedsUpdate
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setGeometryInstancePositions',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, positions, lerp, attributeNeedsUpdate);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
