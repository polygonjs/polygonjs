/**
 * sends a trigger when a video emits an event
 *
 *
 */

import {TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {objectsForActorNode} from '../../scene/utils/actors/ActorsManagerUtils';
import {Object3D} from 'three';
import {BASE_XR_EVENT_INDICES, BASE_XR_SESSION_EVENT_NAMES, BaseXRSessionEventName} from '../../../core/webXR/Common';
import {BaseCoreXRControllerEvent} from '../../../core/webXR/CoreWebXRControllerContainer';

type Listener = (event: BaseCoreXRControllerEvent) => void;
type Listeners = Record<BaseXRSessionEventName, Listener>;

class OnWebXRControllerEventActorParamsConfig extends NodeParamsConfig {
	/** @param  controller index */
	controllerIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new OnWebXRControllerEventActorParamsConfig();

export class OnWebXRControllerEventActorNode extends TypedActorNode<OnWebXRControllerEventActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): ActorType.ON_WEBXR_CONTROLLER_EVENT {
		return ActorType.ON_WEBXR_CONTROLLER_EVENT;
	}

	override initializeNode() {
		// this.io.inputs.setNamedInputConnectionPoints([]);
		this.io.connection_points.spare_params.setInputlessParamNames(['controllerIndex']);
		this.io.outputs.setNamedOutputConnectionPoints(
			BASE_XR_SESSION_EVENT_NAMES.map(
				(triggerName) => new ActorConnectionPoint(triggerName, ActorConnectionPointType.TRIGGER)
			)
		);
	}

	initOnPlay() {
		this._addEventListenersToObjects();
	}
	disposeOnPause() {}

	private async _addEventListenersToObjects() {
		const objects = objectsForActorNode(this);
		for (let object of objects) {
			this._createEventListener(object);
		}
	}
	private _listenerByObjectByControllerIndex: Map<number, Map<Object3D, Listeners>> = new Map();
	private _createEventListener(Object3D: Object3D) {
		const xrController = this.scene().webXR.activeXRController();
		if (!xrController) {
			return;
		}
		const controllerIndex = this.pv.controllerIndex;
		let listenerByObject = this._listenerByObjectByControllerIndex.get(controllerIndex);
		if (!listenerByObject) {
			listenerByObject = new Map();
			this._listenerByObjectByControllerIndex.set(controllerIndex, listenerByObject);
		}
		let listeners = listenerByObject.get(Object3D);
		if (!listeners) {
			const createListener = (eventName: BaseXRSessionEventName) => {
				const listener = (event: BaseCoreXRControllerEvent) => {
					const controllerContainer = event.controllerContainer;
					if (controllerContainer.index != controllerIndex) {
						return;
					}
					this.runTrigger({Object3D}, BASE_XR_EVENT_INDICES.get(eventName));
				};
				return listener;
			};
			listeners = {
				[BaseXRSessionEventName.CONNECTED]: createListener(BaseXRSessionEventName.CONNECTED),
				[BaseXRSessionEventName.DISCONNECTED]: createListener(BaseXRSessionEventName.DISCONNECTED),
				[BaseXRSessionEventName.SELECT]: createListener(BaseXRSessionEventName.SELECT),
				[BaseXRSessionEventName.SELECT_START]: createListener(BaseXRSessionEventName.SELECT_START),
				[BaseXRSessionEventName.SELECT_END]: createListener(BaseXRSessionEventName.SELECT_END),
			};
			listenerByObject.set(Object3D, listeners);
			const controller = xrController.getController(controllerIndex);
			for (let eventName of BASE_XR_SESSION_EVENT_NAMES) {
				controller.addEventListener(eventName, listeners[eventName]);
			}
		}
	}
	override dispose(): void {
		this._removeWebXREventListener();
		super.dispose();
	}
	private _removeWebXREventListener() {
		const xrController = this.scene().webXR.activeXRController();
		if (!xrController) {
			return;
		}
		this._listenerByObjectByControllerIndex.forEach((listenerByObject, controllerIndex) => {
			const controller = xrController.getController(controllerIndex);
			listenerByObject.forEach((listeners, Object3D) => {
				for (let eventName of BASE_XR_SESSION_EVENT_NAMES) {
					controller.removeEventListener(eventName, listeners[eventName]);
				}
			});
		});
	}
}
