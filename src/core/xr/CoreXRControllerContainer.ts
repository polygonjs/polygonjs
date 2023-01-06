import {BaseEvent, EventDispatcher, Ray, WebGLRenderer, XRTargetRaySpace} from 'three';
import {PolyScene} from '../../engine/scene/PolyScene';
import {BASE_XR_SESSION_EVENT_NAMES} from './Common';

export interface BaseCoreXRControllerEvent extends BaseEvent {
	controllerContainer: CoreXRControllerContainer;
}

export class CoreXRControllerContainer extends EventDispatcher<BaseCoreXRControllerEvent> {
	public readonly ray: Ray = new Ray();
	public readonly controller: XRTargetRaySpace;
	constructor(
		public readonly scene: PolyScene,
		public readonly renderer: WebGLRenderer,
		public readonly index: number,
		controllerName: string
	) {
		super();

		this.controller = this.renderer.xr.getController(this.index);
		this.scene.threejsScene().add(this.controller);

		for (let eventName of BASE_XR_SESSION_EVENT_NAMES) {
			const event: BaseCoreXRControllerEvent = {type: eventName, controllerContainer: this};
			this.controller.addEventListener(eventName, (controllerEvent) => {
				this.dispatchEvent(event);
			});
		}
		this.controller.name = controllerName;
	}
}
