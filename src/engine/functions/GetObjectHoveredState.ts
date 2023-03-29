import {Object3D, Intersection} from 'three';
import {isBooleanTrue} from '../../core/Type';
import {RaycasterUpdateOptions} from '../scene/utils/events/PointerEventsController';
import {ObjectNamedFunction3} from './_Base';

const _intersectionByObject: WeakMap<Object3D, Intersection[]> = new Map();
// const _lastIntersectionStateByObject: Map<Object3D, boolean> = new Map();
const raycastUpdateOptions: RaycasterUpdateOptions = {
	pointsThreshold: 0.1,
	lineThreshold: 0.1,
};

export class getObjectHoveredState extends ObjectNamedFunction3<[boolean, number, number]> {
	static override type() {
		return 'getObjectHoveredState';
	}
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
	}
}
