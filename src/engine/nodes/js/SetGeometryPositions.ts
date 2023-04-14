/**
 * Update the geometry positions
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

export const SetGeometryPositionsInputName = {
	[JsConnectionPointType.TRIGGER]: JsConnectionPointType.TRIGGER,
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
	values: 'values',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
	computeNormals: 'computeNormals',
	computeTangents: 'computeTangents',
};
const INPUT_NAMES = [
	SetGeometryPositionsInputName.trigger,
	SetGeometryPositionsInputName.Object3D,
	SetGeometryPositionsInputName.values,
	SetGeometryPositionsInputName.lerp,
	SetGeometryPositionsInputName.attributeNeedsUpdate,
	SetGeometryPositionsInputName.computeNormals,
	SetGeometryPositionsInputName.computeTangents,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryPositionsInputName.lerp]: 1,
	[SetGeometryPositionsInputName.attributeNeedsUpdate]: true,
	[SetGeometryPositionsInputName.computeNormals]: true,
	[SetGeometryPositionsInputName.computeTangents]: true,
};

class SetGeometryPositionsJsParamsConfig extends NodeParamsConfig {
	lerp = ParamConfig.FLOAT(1, {
		range: [0, 1],
	});
	attributeNeedsUpdate = ParamConfig.BOOLEAN(1);
	computeNormals = ParamConfig.BOOLEAN(1);
	computeTangents = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetGeometryPositionsJsParamsConfig();

export class SetGeometryPositionsJsNode extends TypedJsNode<SetGeometryPositionsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryPositions';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this.expectedInputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputNames.bind(this));
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
			JsConnectionPointType.BOOLEAN,
			JsConnectionPointType.BOOLEAN,
		];
	}
	protected _expectedInputName(index: number) {
		return INPUT_NAMES[index];
	}
	protected _expectedOutputTypes() {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D];
	}
	protected _expectedOutputNames(i: number) {
		return [JsConnectionPointType.TRIGGER, JsConnectionPointType.OBJECT_3D][i];
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const values = this.variableForInput(shadersCollectionController, SetGeometryPositionsInputName.values);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const attributeNeedsUpdate = this.variableForInputParam(
			shadersCollectionController,
			this.p.attributeNeedsUpdate
		);
		const computeNormals = this.variableForInputParam(shadersCollectionController, this.p.computeNormals);
		const computeTangents = this.variableForInputParam(shadersCollectionController, this.p.computeTangents);

		const func = Poly.namedFunctionsRegister.getFunction('setGeometryPositions', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, values, lerp, attributeNeedsUpdate, computeNormals, computeTangents);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
