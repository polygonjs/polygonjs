import {Object3D, Intersection} from 'three';
import {isBooleanTrue} from '../../../../core/Type';
import {ObjectNamedFunction3} from '../code/assemblers/NamedFunction';
import {RaycasterUpdateOptions} from '../../../scene/utils/events/PointerEventsController';

const _intersectionByObject: WeakMap<Object3D, Intersection[]> = new Map();
// const _lastIntersectionStateByObject: Map<Object3D, boolean> = new Map();
const raycastUpdateOptions: RaycasterUpdateOptions = {
	pointsThreshold: 0.1,
	lineThreshold: 0.1,
};

export class getObjectHoveredState extends ObjectNamedFunction3<[boolean, number, number]> {
	type = 'getObjectHoveredState';
	func(object3D: Object3D, traverseChildren: boolean, pointsThreshold: number, lineThreshold: number): boolean {
		const pointerEventsController = this.scene.eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster();
		raycastUpdateOptions.pointsThreshold = pointsThreshold;
		raycastUpdateOptions.lineThreshold = lineThreshold;
		pointerEventsController.updateRaycast(raycastUpdateOptions);

		let intersections = _intersectionByObject.get(object3D);
		if (!intersections) {
			intersections = [];
			_intersectionByObject.set(object3D, intersections);
		}
		intersections.length = 0;
		raycaster.value.intersectObject(object3D, isBooleanTrue(traverseChildren), intersections);
		const newHoveredState = intersections[0] != null;
		return newHoveredState;
		// const previousHoveredState = _lastIntersectionStateByObject.get(object3D);
		// const hoveredStateChanged = previousHoveredState == null || newHoveredState != previousHoveredState;
		// if (hoveredStateChanged) {
		// 	_lastIntersectionStateByObject.set(object3D, newHoveredState);
		// }
		// return hoveredStateChanged
	}
}
