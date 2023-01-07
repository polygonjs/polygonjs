import {BaseEvent, Camera, EventDispatcher, Ray, WebGLRenderer, XRTargetRaySpace} from 'three';
import {BASE_XR_SESSION_EVENT_NAMES} from './Common';

export interface BaseCoreXRControllerEvent extends BaseEvent {
	controllerContainer: CoreWebXRControllerContainer;
}

export function webXRControllerName(controllerIndex: number): string {
	return `webXRController-${controllerIndex}`;
}

export class CoreWebXRControllerContainer extends EventDispatcher<BaseCoreXRControllerEvent> {
	public readonly ray: Ray = new Ray();
	public readonly controller: XRTargetRaySpace;
	constructor(public readonly renderer: WebGLRenderer, public readonly index: number) {
		super();

		this.controller = this.renderer.xr.getController(this.index);

		for (let eventName of BASE_XR_SESSION_EVENT_NAMES) {
			const event: BaseCoreXRControllerEvent = {type: eventName, controllerContainer: this};
			this.controller.addEventListener(eventName, (controllerEvent) => {
				this.dispatchEvent(event);
			});
		}
		this.controller.name = webXRControllerName(this.index);
	}
	initialize(camera: Camera | null) {
		if (camera == null) {
			this.controller.parent?.remove(this.controller);
			return;
		}

		const cameraParent = camera.parent;
		if (cameraParent) {
			cameraParent.add(this.controller);
		} else {
			console.warn('camera has no parent, webXR controls cannot be added to the scene');
		}
	}
}
