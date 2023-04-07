/**
 * sends a trigger when the listened object dispatches an event
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {onObjectDispatchFunctionNameByEventName} from '../../functions/ObjectDispatchEvent';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {InitFunctionJsDefinition} from './utils/JsDefinition';
import {sanitizeName} from '../../../core/String';

enum OnObjectDispatchEventJsNodeInputName {
	eventName = 'eventName',
}
// type Listener = () => void;

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
	override isTriggering() {
		return true;
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
	override wrappedBodyLinesMethodName() {
		return onObjectDispatchFunctionNameByEventName(sanitizeName(this.pv.eventNames));
	}
	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const eventNames = this.variableForInputParam(shadersCollectionController, this.p.eventNames);
		const func = Poly.namedFunctionsRegister.getFunction(
			'objectAddEventListeners',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(
			object3D,
			eventNames,
			`this`,
			`this.${this.wrappedBodyLinesMethodName()}.bind(this)`
		);
		// shadersCollectionController.addActionBodyLines(this, [bodyLine]);
		shadersCollectionController.addDefinitions(this, [
			new InitFunctionJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.OBJECT_3D,
				this.path(),
				bodyLine
			),
		]);

		shadersCollectionController.addTriggeringLines(this, [triggeredMethods]);
	}

	// override setLines(shadersCollectionController: ShadersCollectionController) {

	// }

	// private _lastReceivedEventName: string | undefined;

	// public override outputValue(
	// 	context: JsNodeTriggerContext,
	// 	outputName: OnObjectDispatchEventJsNodeInputName | string
	// ): ReturnValueTypeByJsConnectionPointType[JsConnectionPointType] | undefined {
	// 	return this._lastReceivedEventName || '';
	// }

	// initOnPlay() {
	// 	this._addEventListenersToObjects();
	// }
	// disposeOnPause() {}
	// private _addEventListenersToObjects() {
	// const eventNames = this.pv.eventNames.split(' ');
	// const objects = objectsForJsNode(this);
	// for (let object of objects) {
	// 	for (let eventName of eventNames) {
	// 		this._createEventListener(eventName, object);
	// 	}
	// }
	// }
	// private _listenerByObject: Map<Object3D, Map<string, Listener>> = new Map();
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
	// override dispose(): void {
	// 	this._listenerByObject.forEach((map, Object3D) => {
	// 		map.forEach((listener, eventName) => {
	// 			Object3D.removeEventListener(eventName, listener);
	// 		});
	// 	});
	// }
}
