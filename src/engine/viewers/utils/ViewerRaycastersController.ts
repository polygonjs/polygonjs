import {BaseViewerType} from '../_Base';
import {Vector2Like} from '../../../types/GlobalTypes';
import {PointerEventsController} from '../../scene/utils/events/PointerEventsController';

export class ViewerRaycastersController {
	// private readonly _cursor0 = new Vector2();
	// private readonly _raycaster0: Raycaster;
	// private readonly _raycaster1 = createRaycaster();
	// private readonly _raycasters: [RaycasterForBVH, RaycasterForBVH] = [this._raycaster0, this._raycaster1];
	pointerEventsController: PointerEventsController;
	constructor(protected viewer: BaseViewerType) {
		const scene = this.viewer.scene();
		this.pointerEventsController = scene.eventsDispatcher.pointerEventsController;

		this.pointerEventsController.setRaycaster(viewer.createRaycaster());
		// this._raycaster0 = viewer.createRaycaster();
	}

	setCursor0(cursor: Vector2Like) {
		this.pointerEventsController.cursor().value.set(cursor.x, cursor.y);
		// this._cursor0.y = cursor.y;
	}
	raycaster0() {
		return this.pointerEventsController.raycaster().value;
	}

	updateRaycasters() {
		this.pointerEventsController
			.raycaster()
			.value.setFromCamera(this.pointerEventsController.cursor().value, this.viewer.camera());
	}
}
