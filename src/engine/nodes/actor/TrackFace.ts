/**
 * track face features from image, video or webcam
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';

import {computerVisionValidSource} from '../../../core/computerVision/Common';
import {CoreComputerVisionFace} from '../../../core/computerVision/face/CoreComputerVisionFace';
import {ParamType} from '../../poly/ParamType';
import {TypeAssert} from '../../poly/Assert';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum TrackFaceActorNodeOutput {
	LANDMARKS = 'landmarks',
}

class TrackFaceActorParamsConfig extends NodeParamsConfig {
	faceIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TrackFaceActorParamsConfig();

export class TrackFaceActorNode extends TypedActorNode<TrackFaceActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'TrackFace';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.TEXTURE,
				ActorConnectionPointType.TEXTURE,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TrackFaceActorNodeOutput.LANDMARKS, ActorConnectionPointType.VECTOR4_ARRAY),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const texture = this._inputValue<ActorConnectionPointType.TEXTURE>(ActorConnectionPointType.TEXTURE, context);

		if (!texture) {
			return;
		}
		const source = computerVisionValidSource(texture);
		if (!source) {
			return;
		}

		CoreComputerVisionFace.trackMedia(Object3D, source);
	}
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: TrackFaceActorNodeOutput
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const faceIndex = this._inputValueFromParam<ParamType.INTEGER>(this.p.faceIndex, context);

		const results = CoreComputerVisionFace.trackerResults(Object3D);
		switch (outputName) {
			case TrackFaceActorNodeOutput.LANDMARKS: {
				if (results) {
					return results[faceIndex].multiFaceLandmarks;
				} else {
					return [];
				}
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
