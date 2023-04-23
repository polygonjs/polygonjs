/**
 * track hand features from image, video or webcam
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {handTrackingVector4Array} from '../../../core/computerVision/hand/Data';
import {VectorArray} from './code/assemblers/_BaseJsPersistedConfigUtils';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum TrackHandJsNodeOutput {
	NORMALIZED_LANDMARKS = 'normalizedLandmarks',
	WORLD_LANDMARKS = 'worldLandmarks',
}

class TrackHandJsParamsConfig extends NodeParamsConfig {
	handIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TrackHandJsParamsConfig();

export class TrackHandJsNode extends TypedJsNode<TrackHandJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'trackHand';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.TEXTURE, JsConnectionPointType.TEXTURE, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TrackHandJsNodeOutput.NORMALIZED_LANDMARKS, JsConnectionPointType.VECTOR4_ARRAY),
			new JsConnectionPoint(TrackHandJsNodeOutput.WORLD_LANDMARKS, JsConnectionPointType.VECTOR4_ARRAY),
		]);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// action
		const texture = this.variableForInput(shadersCollectionController, JsConnectionPointType.TEXTURE);
		const func = Poly.namedFunctionsRegister.getFunction('trackHand', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, texture);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// get
		const usedOutputNames = this.io.outputs.used_output_names();
		const handIndex = this.variableForInputParam(shadersCollectionController, this.p.handIndex);
		const _v4 = (
			propertyName: TrackHandJsNodeOutput,
			functionName: 'trackHandGetNormalizedLandmarks' | 'trackHandGetWorldLandmarks',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName = shadersCollectionController.addVariable(
				this,
				new VectorArray(handTrackingVector4Array())
			);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, handIndex, tmpVarName),
				},
			]);
		};
		_v4(
			TrackHandJsNodeOutput.NORMALIZED_LANDMARKS,
			'trackHandGetNormalizedLandmarks',
			JsConnectionPointType.VECTOR4_ARRAY
		);
		_v4(TrackHandJsNodeOutput.WORLD_LANDMARKS, 'trackHandGetWorldLandmarks', JsConnectionPointType.VECTOR4_ARRAY);
	}
}
