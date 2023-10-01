import {BaseEvent, Camera, EventDispatcher, Ray, WebGLRenderer, XRTargetRaySpace} from 'three';
import {BASE_XR_SESSION_EVENT_NAMES} from './Common';
import {removeFromParent} from '../../engine/poly/PolyOnObjectsAddRemoveHooksController';
import {PolyScene} from '../../engine/scene/PolyScene';

export interface BaseCoreXRControllerEvent extends BaseEvent {
	controllerContainer: CoreWebXRControllerContainer;
}

export function webXRControllerName(controllerIndex: number): string {
	return `webXRController-${controllerIndex}`;
}

export class CoreWebXRControllerContainer extends EventDispatcher<BaseCoreXRControllerEvent> {
	public readonly ray: Ray = new Ray();
	public readonly controller: XRTargetRaySpace;
	constructor(
		public readonly scene: PolyScene,
		public readonly renderer: WebGLRenderer,
		public readonly index: number
	) {
		super();

		this.controller = this.renderer.xr.getController(this.index);

		for (const eventName of BASE_XR_SESSION_EVENT_NAMES) {
			const event: BaseCoreXRControllerEvent = {type: eventName, controllerContainer: this};
			this.controller.addEventListener(eventName, (controllerEvent) => {
				this.dispatchEvent(event);
			});
		}
		this.controller.name = webXRControllerName(this.index);
	}
	initialize(camera: Camera | null) {
		if (camera == null) {
			removeFromParent(this.scene, this.controller);
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
