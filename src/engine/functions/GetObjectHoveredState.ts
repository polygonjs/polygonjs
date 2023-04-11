import {Ref} from '@vue/reactivity';
import {Object3D, Intersection} from 'three';
import {isBooleanTrue} from '../../core/Type';
import {RaycasterUpdateOptions} from '../scene/utils/events/PointerEventsController';
import {ObjectNamedFunction0, ObjectNamedFunction4} from './_Base';

const _intersectionByObject: WeakMap<Object3D, Intersection[]> = new Map();
// const _lastIntersectionStateByObject: Map<Object3D, boolean> = new Map();
const raycastUpdateOptions: RaycasterUpdateOptions = {
	pointsThreshold: 0.1,
	lineThreshold: 0.1,
};

function _getObjectHoveredIntersections(object3D: Object3D): Intersection[] {
	let intersections = _intersectionByObject.get(object3D);
	if (!intersections) {
		intersections = [];
		_intersectionByObject.set(object3D, intersections);
	}
	return intersections;
}
export class getObjectHoveredIntersection extends ObjectNamedFunction0 {
	static override type() {
		return 'getObjectHoveredIntersection';
	}
	func(object3D: Object3D): Intersection {
		return _getObjectHoveredIntersections(object3D)[0];
	}
}

export class getObjectHoveredState extends ObjectNamedFunction4<[boolean, number, number, Ref<Intersection | null>]> {
	static override type() {
		return 'getObjectHoveredState';
	}
	func(
		object3D: Object3D,
		traverseChildren: boolean,
		pointsThreshold: number,
		lineThreshold: number,
		intersectionRef: Ref<Intersection | null>
	): boolean {
		const pointerEventsController = this.scene.eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster();
		raycastUpdateOptions.pointsThreshold = pointsThreshold;
		raycastUpdateOptions.lineThreshold = lineThreshold;
		pointerEventsController.updateRaycast(raycastUpdateOptions);

		const intersections = _getObjectHoveredIntersections(object3D);
		intersections.length = 0;
		raycaster.value.intersectObject(object3D, isBooleanTrue(traverseChildren), intersections);
		const firstIntersection = intersections[0];
		intersectionRef.value = firstIntersection || null;
		const newHoveredState = firstIntersection != null;
		return newHoveredState;
	}
}
