/**
 * track hand features from image, video or webcam
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
import {CoreComputerVisionHand} from '../../../core/computerVision/hand/CoreComputerVisionHand';
import {TypeAssert} from '../../poly/Assert';
import {computerVisionValidSource} from '../../../core/computerVision/Common';
import {ParamType} from '../../poly/ParamType';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum TrackHandActorNodeOutput {
	NORMALIZED_LANDMARKS = 'normalizedLandmarks',
	WORLD_LANDMARKS = 'worldLandmarks',
}

class TrackHandActorParamsConfig extends NodeParamsConfig {
	handIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TrackHandActorParamsConfig();

export class TrackHandActorNode extends TypedActorNode<TrackHandActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'trackHand';
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
			new ActorConnectionPoint(
				TrackHandActorNodeOutput.NORMALIZED_LANDMARKS,
				ActorConnectionPointType.VECTOR4_ARRAY
			),
			new ActorConnectionPoint(TrackHandActorNodeOutput.WORLD_LANDMARKS, ActorConnectionPointType.VECTOR4_ARRAY),
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

		CoreComputerVisionHand.trackMedia(Object3D, source);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: TrackHandActorNodeOutput
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const handIndex = this._inputValueFromParam<ParamType.INTEGER>(this.p.handIndex, context);

		const results = CoreComputerVisionHand.trackerResults(Object3D);
		switch (outputName) {
			case TrackHandActorNodeOutput.NORMALIZED_LANDMARKS: {
				if (results) {
					return results[handIndex].multiHandLandmarks;
				} else {
					return [];
				}
			}
			case TrackHandActorNodeOutput.WORLD_LANDMARKS: {
				if (results) {
					return results[handIndex].multiHandWorldLandmarks;
				} else {
					return [];
				}
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
