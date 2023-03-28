import {Ray, Raycaster, Vector2} from 'three';
import {NamedFunction0} from './_Base';

export class globalsTime extends NamedFunction0 {
	static override type() {
		return 'globalsTime';
	}
	func(): number {
		return this.scene.timeController.timeUniform().value;
	}
}
export class globalsTimeDelta extends NamedFunction0 {
	static override type() {
		return 'globalsTimeDelta';
	}
	func(): number {
		return this.scene.timeController.timeDeltaUniform().value;
	}
}

export class globalsRaycaster extends NamedFunction0 {
	static override type() {
		return 'globalsRaycaster';
	}
	func(): Raycaster {
		return this.scene.eventsDispatcher.pointerEventsController.raycaster().value;
	}
}
export class globalsRayFromCursor extends NamedFunction0 {
	static override type() {
		return 'globalsRayFromCursor';
	}
	func(): Ray {
		return this.scene.eventsDispatcher.pointerEventsController.raycaster().value.ray;
	}
}
export class globalsCursor extends NamedFunction0 {
	static override type() {
		return 'globalsCursor';
	}
	func(): Vector2 {
		return this.scene.eventsDispatcher.pointerEventsController.cursor().value;
	}
}
