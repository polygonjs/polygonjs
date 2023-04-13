import {Ray, Raycaster, Vector2} from 'three';
import {ShadersCollectionController} from '../nodes/js/code/utils/ShadersCollectionController';
import {BaseNodeType} from '../nodes/_Base';
import {PointerEventsController} from '../scene/utils/events/PointerEventsController';
import {NamedFunction0} from './_Base';

abstract class GlobalsTimeFunction0 extends NamedFunction0 {
	constructor(node: BaseNodeType, shadersCollectionController?: ShadersCollectionController) {
		super(node, shadersCollectionController);
		this.timeController = node.scene().timeController;
	}
}

// abstract class EventsTimeFunction0 extends NamedFunction0 {
// 	protected eventsDispatcher: SceneEventsDispatcher
// 	constructor( node: BaseNodeType,  shadersCollectionController?: ShadersCollectionController) {
// 		super(node,shadersCollectionController);
// 		this.eventsDispatcher = node.scene().eventsDispatcher;
// 	}
// }
abstract class PointerEventsTimeFunction0 extends NamedFunction0 {
	protected pointerEventsController: PointerEventsController;
	constructor(node: BaseNodeType, shadersCollectionController?: ShadersCollectionController) {
		super(node, shadersCollectionController);
		this.pointerEventsController = node.scene().eventsDispatcher.pointerEventsController;
	}
}
export class globalsTime extends GlobalsTimeFunction0 {
	static override type() {
		return 'globalsTime';
	}
	func(): number {
		return this.timeController.timeUniform().value;
	}
}
export class globalsTimeDelta extends GlobalsTimeFunction0 {
	static override type() {
		return 'globalsTimeDelta';
	}
	func(): number {
		return this.timeController.timeDeltaUniform().value;
	}
}

export class globalsRaycaster extends PointerEventsTimeFunction0 {
	static override type() {
		return 'globalsRaycaster';
	}
	func(): Raycaster {
		return this.pointerEventsController.raycaster().value;
	}
}
export class globalsRayFromCursor extends PointerEventsTimeFunction0 {
	static override type() {
		return 'globalsRayFromCursor';
	}
	func(): Ray {
		return this.pointerEventsController.raycaster().value.ray;
	}
}
export class globalsCursor extends PointerEventsTimeFunction0 {
	static override type() {
		return 'globalsCursor';
	}
	func(): Vector2 {
		return this.pointerEventsController.cursor().value;
	}
}
