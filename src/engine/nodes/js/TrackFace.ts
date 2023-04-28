/**
 * track face features from image, video or webcam
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';

import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {VectorArray} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {faceTrackingVector4Array} from '../../../core/computerVision/face/Data';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum TrackFaceJsNodeOutput {
	LANDMARKS = 'landmarks',
}

class TrackFaceJsParamsConfig extends NodeParamsConfig {
	faceIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TrackFaceJsParamsConfig();

export class TrackFaceJsNode extends TypedJsNode<TrackFaceJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'TrackFace';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.TEXTURE, JsConnectionPointType.TEXTURE, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TrackFaceJsNodeOutput.LANDMARKS, JsConnectionPointType.VECTOR4_ARRAY),
		]);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// action
		const texture = this.variableForInput(shadersCollectionController, JsConnectionPointType.TEXTURE);
		const func = Poly.namedFunctionsRegister.getFunction('trackFace', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, texture);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// get
		const usedOutputNames = this.io.outputs.used_output_names();
		const faceIndex = this.variableForInputParam(shadersCollectionController, this.p.faceIndex);
		const _v4 = (
			propertyName: TrackFaceJsNodeOutput,
			functionName: 'trackFaceGetLandmarks',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName =shadersCollectionController.addVariable(this,  new VectorArray(faceTrackingVector4Array()));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, faceIndex, tmpVarName),
				},
			]);
		};
		_v4(TrackFaceJsNodeOutput.LANDMARKS, 'trackFaceGetLandmarks', JsConnectionPointType.VECTOR4_ARRAY);
	}
}
