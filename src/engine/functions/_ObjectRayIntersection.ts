import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import type {AddObjectToHoverOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsHoverController';
import type {AddObjectToPointerdownOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerdownController';
import type {AddObjectToPointerupOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerupController';

export class addObjectToHoveredCheck extends ObjectNamedFunction2<[ActorEvaluator, AddObjectToHoverOptions]> {
	static override type() {
		return 'addObjectToHoveredCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: AddObjectToHoverOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionHover;
		controller.addObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removeObject(object3D);
		});
	}
}

export class addObjectToPointerdownCheck extends ObjectNamedFunction2<[ActorEvaluator, AddObjectToPointerdownOptions]> {
	static override type() {
		return 'addObjectToPointerdownCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: AddObjectToPointerdownOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionPointerdown;
		controller.addObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removeObject(object3D);
		});
	}
}
export class addObjectToPointerupCheck extends ObjectNamedFunction2<[ActorEvaluator, AddObjectToPointerupOptions]> {
	static override type() {
		return 'addObjectToPointerupCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: AddObjectToPointerupOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionPointerup;
		controller.addObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removeObject(object3D);
		});
	}
}
