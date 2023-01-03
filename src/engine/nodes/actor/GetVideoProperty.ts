/**
 * get a video property
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {VideoCopNode} from '../cop/Video';
import {TypeAssert} from '../../poly/Assert';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetVideoPropertyActorNodeOutputName {
	currentTime = 'currentTime',
	duration = 'duration',
	playing = 'playing',
	muted = 'muted',
}
// const VIDEO_PROPERTIES: GetVideoPropertyActorNodeInputName[] = [GetVideoPropertyActorNodeInputName.playing,GetVideoPropertyActorNodeInputName.muted];
class GetVideoPropertyActorParamsConfig extends NodeParamsConfig {
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
			types: [CopType.VIDEO],
		},
		computeOnDirty: true,
	});
}
const ParamsConfig = new GetVideoPropertyActorParamsConfig();

export class GetVideoPropertyActorNode extends TypedActorNode<GetVideoPropertyActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getVideoProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetVideoPropertyActorNodeOutputName.currentTime, ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint(GetVideoPropertyActorNodeOutputName.duration, ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint(GetVideoPropertyActorNodeOutputName.playing, ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint(GetVideoPropertyActorNodeOutputName.muted, ActorConnectionPointType.BOOLEAN),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetVideoPropertyActorNodeOutputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const foundNode = this.pv.node.nodeWithContext(NodeContext.COP);
		if (foundNode && foundNode.type() == CopType.VIDEO) {
			const videoNode = foundNode as VideoCopNode;
			switch (outputName) {
				case GetVideoPropertyActorNodeOutputName.currentTime: {
					return videoNode.videoCurrentTime();
				}
				case GetVideoPropertyActorNodeOutputName.duration: {
					return videoNode.videoDuration();
				}
				case GetVideoPropertyActorNodeOutputName.playing: {
					return videoNode.videoStatePlaying();
				}
				case GetVideoPropertyActorNodeOutputName.muted: {
					return videoNode.videoStateMuted();
				}
			}
			TypeAssert.unreachable(outputName);
		}
		return false;
	}
}
