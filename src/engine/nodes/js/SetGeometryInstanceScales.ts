/**
 * Update the geometry instance scales
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

export const SetGeometryInstanceScalesInputName = {
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	scale: 'scale',
	mult: 'mult',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
};
const INPUT_NAMES = [
	SetGeometryInstanceScalesInputName.trigger,
	SetGeometryInstanceScalesInputName.Object3D,
	SetGeometryInstanceScalesInputName.scale,
	SetGeometryInstanceScalesInputName.mult,
	SetGeometryInstanceScalesInputName.lerp,
	SetGeometryInstanceScalesInputName.attributeNeedsUpdate,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryInstanceScalesInputName.lerp]: 1,
	[SetGeometryInstanceScalesInputName.attributeNeedsUpdate]: true,
};

class SetGeometryInstanceScalesJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryInstanceScalesJsParamsConfig();

export class SetGeometryInstanceScalesJsNode extends TypedJsNode<SetGeometryInstanceScalesJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryInstanceScales';
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
			JsConnectionPointType.FLOAT_ARRAY,
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
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const scales = this.variableForInput(shadersCollectionController, SetGeometryInstanceScalesInputName.scale);
		const mult = this.variableForInput(shadersCollectionController, SetGeometryInstanceScalesInputName.mult);
		const lerp = this.variableForInput(shadersCollectionController, SetGeometryInstanceScalesInputName.lerp);
		const attributeNeedsUpdate = this.variableForInput(
			shadersCollectionController,
			SetGeometryInstanceScalesInputName.attributeNeedsUpdate
		);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setGeometryInstanceScales',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, scales, mult, lerp, attributeNeedsUpdate);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
