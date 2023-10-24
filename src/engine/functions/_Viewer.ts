import {Vector3, EventListener} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import {CAMERA_CONTROLS_EVENTS, CameraControlsEvent} from '../viewers/utils/ViewerControlsController';

export class setViewer extends NamedFunction2<[string, boolean]> {
	static override type() {
		return 'setViewer';
	}
	func(className: string, addClass: boolean): void {
		const viewer = this.scene.viewersRegister.firstViewer();
		const canvas = viewer?.canvas();
		if (!canvas) {
			return;
		}
		if (viewer) {
			if (addClass) {
				canvas.classList.add(className);
			} else {
				canvas.classList.remove(className);
			}
		}
	}
}

export class setViewerControls extends NamedFunction3<[boolean, boolean, Vector3]> {
	static override type() {
		return 'setViewerControls';
	}
	func(active: boolean, updateTarget: boolean, controlsTarget: Vector3): void {
		const viewer = this.scene.viewersRegister.firstViewer();
		if (!viewer) {
			return;
		}
		const controlsController = viewer.controlsController();
		controlsController.setActive(active);
		if (updateTarget) {
			controlsController.setTarget(controlsTarget);
		}
	}
}

type CallbackByCameraControlsEvent = Record<CameraControlsEvent, EventListener<any, any, any>>;

export class onViewerControlsEvent extends NamedFunction2<[CallbackByCameraControlsEvent, ActorEvaluator]> {
	static override type() {
		return 'onViewerControlsEvent';
	}
	func(callbacks: CallbackByCameraControlsEvent, evaluator: ActorEvaluator): void {
		const viewer = this.scene.viewersRegister.firstViewer();
		if (!viewer) {
			return;
		}
		for (const eventName of CAMERA_CONTROLS_EVENTS) {
			viewer.controlsController().addEventListener(CameraControlsEvent[eventName], callbacks[eventName]);
		}

		evaluator.onDispose(() => {
			for (const eventName of CAMERA_CONTROLS_EVENTS) {
				viewer.controlsController().removeEventListener(CameraControlsEvent[eventName], callbacks[eventName]);
			}
		});
	}
}
