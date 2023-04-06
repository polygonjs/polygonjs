/**
 * sends a trigger when the listened object dispatches an event
 *
 *
 */
import {Object3D} from 'three';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
// import {objectsForJsNode} from '../../scene/utils/actors/JssManagerUtils';
import {JsType} from '../../poly/registers/nodes/types/Js';

enum OnObjectDispatchEventJsNodeInputName {
	eventName = 'eventName',
}
type Listener = () => void;

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectDispatchEventJsParamsConfig extends NodeParamsConfig {
	/** @param event names (space separated) */
	eventNames = ParamConfig.STRING('my-eventA my-eventB');
}
const ParamsConfig = new OnObjectDispatchEventJsParamsConfig();

export class OnObjectDispatchEventJsNode extends TypedJsNode<OnObjectDispatchEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): JsType.ON_OBJECT_DISPATCH_EVENT {
		return JsType.ON_OBJECT_DISPATCH_EVENT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['eventNames']);
		this.io.inputs.setNamedInputConnectionPoints([
			// new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			// new JsConnectionPoint(
			// 	JsConnectionPointType.OBJECT_3D,
			// 	JsConnectionPointType.OBJECT_3D,
			// 	CONNECTION_OPTIONS
			// ),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				OnObjectDispatchEventJsNodeInputName.eventName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);
	}

	// private _lastReceivedEventName: string | undefined;

	// public override outputValue(
	// 	context: JsNodeTriggerContext,
	// 	outputName: OnObjectDispatchEventJsNodeInputName | string
	// ): ReturnValueTypeByJsConnectionPointType[JsConnectionPointType] | undefined {
	// 	return this._lastReceivedEventName || '';
	// }

	initOnPlay() {
		this._addEventListenersToObjects();
	}
	disposeOnPause() {}
	private _addEventListenersToObjects() {
		// const eventNames = this.pv.eventNames.split(' ');
		// const objects = objectsForJsNode(this);
		// for (let object of objects) {
		// 	for (let eventName of eventNames) {
		// 		this._createEventListener(eventName, object);
		// 	}
		// }
	}
	private _listenerByObject: Map<Object3D, Map<string, Listener>> = new Map();
	// private _createEventListener(eventName: string, Object3D: Object3D) {
	// 	let listenerByEventName = this._listenerByObject.get(Object3D);
	// 	if (!listenerByEventName) {
	// 		listenerByEventName = new Map();
	// 		this._listenerByObject.set(Object3D, listenerByEventName);
	// 	}
	// 	let listener = listenerByEventName.get(eventName);
	// 	if (!listener) {
	// 		listener = () => {
	// 			this._lastReceivedEventName = eventName;
	// 			this.runTrigger({Object3D});
	// 		};
	// 		Object3D.addEventListener(eventName, listener);
	// 		listenerByEventName.set(eventName, listener);
	// 	}
	// }
	override dispose(): void {
		this._listenerByObject.forEach((map, Object3D) => {
			map.forEach((listener, eventName) => {
				Object3D.removeEventListener(eventName, listener);
			});
		});
	}
}
