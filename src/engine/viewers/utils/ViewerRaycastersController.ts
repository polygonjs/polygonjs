import type {BaseViewerType} from '../_Base';
import type {Vector2Like} from '../../../types/GlobalTypes';
import type {PointerEventsController} from '../../scene/utils/events/PointerEventsController';

export class ViewerRaycastersController {
	pointerEventsController: PointerEventsController;
	constructor(protected viewer: BaseViewerType) {
		const scene = this.viewer.scene();
		this.pointerEventsController = scene.eventsDispatcher.pointerEventsController;

		this.pointerEventsController.setRaycaster(viewer.createRaycaster());
	}

	setCursor0(cursor: Vector2Like) {
		this.pointerEventsController.cursor().value.set(cursor.x, cursor.y);
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
