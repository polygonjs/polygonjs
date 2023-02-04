/**
 * sends a trigger when the listened object dispatches an event
 *
 *
 */
import {ReturnValueTypeByActorConnectionPointType} from './../utils/io/connections/Actor';
import {Object3D} from 'three';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {objectsForActorNode} from '../../scene/utils/actors/ActorsManagerUtils';
import {ActorType} from '../../poly/registers/nodes/types/Actor';

enum OnObjectDispatchEventActorNodeInputName {
	eventName = 'eventName',
}
type Listener = () => void;

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectDispatchEventActorParamsConfig extends NodeParamsConfig {
	/** @param event names (space separated) */
	eventNames = ParamConfig.STRING('my-eventA my-eventB');
}
const ParamsConfig = new OnObjectDispatchEventActorParamsConfig();

export class OnObjectDispatchEventActorNode extends TypedActorNode<OnObjectDispatchEventActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): ActorType.ON_OBJECT_DISPATCH_EVENT {
		return ActorType.ON_OBJECT_DISPATCH_EVENT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['eventNames']);
		this.io.inputs.setNamedInputConnectionPoints([
			// new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			// new ActorConnectionPoint(
			// 	ActorConnectionPointType.OBJECT_3D,
			// 	ActorConnectionPointType.OBJECT_3D,
			// 	CONNECTION_OPTIONS
			// ),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				OnObjectDispatchEventActorNodeInputName.eventName,
				ActorConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);
	}

	private _lastReceivedEventName: string | undefined;

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: OnObjectDispatchEventActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		return this._lastReceivedEventName || '';
	}

	initOnPlay() {
		this._addEventListenersToObjects();
	}
	private _addEventListenersToObjects() {
		const eventNames = this.pv.eventNames.split(' ');
		const objects = objectsForActorNode(this);
		for (let object of objects) {
			for (let eventName of eventNames) {
				this._createEventListener(eventName, object);
			}
		}
	}
	private _listenerByObject: Map<Object3D, Map<string, Listener>> = new Map();
	private _createEventListener(eventName: string, Object3D: Object3D) {
		let listenerByEventName = this._listenerByObject.get(Object3D);
		if (!listenerByEventName) {
			listenerByEventName = new Map();
			this._listenerByObject.set(Object3D, listenerByEventName);
		}
		let listener = listenerByEventName.get(eventName);
		if (!listener) {
			listener = () => {
				this._lastReceivedEventName = eventName;
				this.runTrigger({Object3D});
			};
			Object3D.addEventListener(eventName, listener);
			listenerByEventName.set(eventName, listener);
		}
	}
	override dispose(): void {
		this._listenerByObject.forEach((map, Object3D) => {
			map.forEach((listener, eventName) => {
				Object3D.removeEventListener(eventName, listener);
			});
		});
	}
}
