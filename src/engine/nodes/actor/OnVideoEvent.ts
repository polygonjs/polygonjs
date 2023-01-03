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
import {PolyScene} from '../../index_all';
import {objectsForActorNode} from '../../scene/utils/actors/ActorsManagerUtils';
import {Object3D} from 'three';
import {VideoEvent, VIDEO_EVENTS, VIDEO_EVENT_INDICES} from '../../../core/Video';

type Listener = () => void;
type Listeners = Record<VideoEvent, Listener>;

class OnVideoEventActorParamsConfig extends NodeParamsConfig {
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

	static addEventListeners(scene: PolyScene) {
		const nodes = scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, this.type());

		for (let node of nodes) {
			node._addEventListenersToObjects();
		}
	}
	private _videoNode: VideoCopNode | undefined;
	private async _addEventListenersToObjects() {
		if (this.p.node.isDirty()) {
			await this.p.node.compute();
		}
		const foundNode = this.pv.node.nodeWithContext(NodeContext.COP);
		this._removeVideoNodeEventListener();
		this._videoNode = undefined;
		// let videoNode: VideoCopNode | undefined;
		if (foundNode && foundNode.type() == CopType.VIDEO) {
			this._videoNode = foundNode as VideoCopNode;
		}
		if (!this._videoNode) {
			console.warn('no video node found');
			return;
		}

		const objects = objectsForActorNode(this);
		for (let object of objects) {
			this._createEventListener(this._videoNode, object);
		}
	}
	private _listenerByObject: Map<Object3D, Listeners> = new Map();
	private _createEventListener(videoNode: VideoCopNode, Object3D: Object3D) {
		let listeners = this._listenerByObject.get(Object3D);
		if (!listeners) {
			listeners = {
				play: () => {
					this.runTrigger({Object3D}, VIDEO_EVENT_INDICES.get(VideoEvent.PLAY));
				},
				pause: () => {
					this.runTrigger({Object3D}, VIDEO_EVENT_INDICES.get(VideoEvent.PAUSE));
				},
				timeupdate: () => {
					this.runTrigger({Object3D}, VIDEO_EVENT_INDICES.get(VideoEvent.TIME_UPDATE));
				},
				volumechange: () => {
					this.runTrigger({Object3D}, VIDEO_EVENT_INDICES.get(VideoEvent.VOLUME_CHANGE));
				},
			};
			this._listenerByObject.set(Object3D, listeners);
		}
		for (let eventName of VIDEO_EVENTS) {
			videoNode.addEventListener(eventName, listeners[eventName]);
		}
	}
	override dispose(): void {
		this._removeVideoNodeEventListener();
		super.dispose();
	}
	private _removeVideoNodeEventListener() {
		if (!this._videoNode) {
			return;
		}
		const videoNode = this._videoNode;
		this._listenerByObject.forEach((listeners, Object3D) => {
			for (let eventName of VIDEO_EVENTS) {
				videoNode.removeEventListener(eventName, listeners[eventName]);
			}
		});
	}
}
