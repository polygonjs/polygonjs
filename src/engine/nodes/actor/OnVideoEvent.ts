/**
 * sends a trigger when a video emits an event
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {NodeContext} from '../../poly/NodeContext';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {VideoCopNode} from '../cop/Video';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
// import {objectsForActorNode} from '../../scene/utils/actors/ActorsManagerUtils';
import {Object3D} from 'three';
import {
	VideoEvent,
	VIDEO_EVENTS,
	//   VIDEO_EVENT_INDICES
} from '../../../core/VideoEvent';

type Listener = () => void;
type Listeners = Record<VideoEvent, Listener>;

class OnVideoEventActorParamsConfig extends NodeParamsConfig {
	/** @param video node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
			types: [CopType.VIDEO],
		},
		computeOnDirty: true,
	});
}
const ParamsConfig = new OnVideoEventActorParamsConfig();

export class OnVideoEventActorNode extends TypedActorNode<OnVideoEventActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): ActorType.ON_VIDEO_EVENT {
		return ActorType.ON_VIDEO_EVENT;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			VIDEO_EVENTS.map((triggerName) => new ActorConnectionPoint(triggerName, ActorConnectionPointType.TRIGGER))
		);
	}

	initOnPlay() {
		this._addEventListenersToObjects();
	}
	disposeOnPause() {}

	private async _addEventListenersToObjects() {
		if (this.p.node.isDirty()) {
			await this.p.node.compute();
		}
		const foundNode = this.pv.node.nodeWithContext(NodeContext.COP);
		this._removeVideoNodeEventListener();
		let videoNode = undefined;
		// let videoNode: VideoCopNode | undefined;
		if (foundNode && foundNode.type() == CopType.VIDEO) {
			videoNode = foundNode as VideoCopNode;
		}
		if (!videoNode) {
			console.warn('no video node found');
			return;
		}

		// const objects = objectsForActorNode(this);
		// for (let object of objects) {
		// 	this._createEventListener(videoNode, object);
		// }
	}
	private _listenerByObjectByVideoNode: Map<VideoCopNode, Map<Object3D, Listeners>> = new Map();
	// private _createEventListener(videoNode: VideoCopNode, Object3D: Object3D) {
	// 	let listenerByObject = this._listenerByObjectByVideoNode.get(videoNode);
	// 	if (!listenerByObject) {
	// 		listenerByObject = new Map();
	// 		this._listenerByObjectByVideoNode.set(videoNode, listenerByObject);
	// 	}
	// 	let listeners = listenerByObject.get(Object3D);
	// 	if (!listeners) {
	// 		const createListener = (eventName: VideoEvent) => {
	// 			const listener = () => {
	// 				this.runTrigger({Object3D}, VIDEO_EVENT_INDICES.get(eventName));
	// 			};
	// 			return listener;
	// 		};
	// 		listeners = {
	// 			[VideoEvent.PLAY]: createListener(VideoEvent.PLAY),
	// 			[VideoEvent.PAUSE]: createListener(VideoEvent.PAUSE),
	// 			[VideoEvent.TIME_UPDATE]: createListener(VideoEvent.TIME_UPDATE),
	// 			[VideoEvent.VOLUME_CHANGE]: createListener(VideoEvent.VOLUME_CHANGE),
	// 		};
	// 		listenerByObject.set(Object3D, listeners);
	// 		for (let eventName of VIDEO_EVENTS) {
	// 			videoNode.addEventListener(eventName, listeners[eventName]);
	// 		}
	// 	}
	// }
	override dispose(): void {
		this._removeVideoNodeEventListener();
		super.dispose();
	}
	private _removeVideoNodeEventListener() {
		this._listenerByObjectByVideoNode.forEach((listenerByObject, videoNode) => {
			listenerByObject.forEach((listeners, Object3D) => {
				for (let eventName of VIDEO_EVENTS) {
					videoNode.removeEventListener(eventName, listeners[eventName]);
				}
			});
		});
	}
}
