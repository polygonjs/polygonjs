import {Vector3} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';

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
