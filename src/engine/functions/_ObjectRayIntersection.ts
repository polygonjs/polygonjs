import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import type {ObjectToContextmenuOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsContextmenuController';
import type {ObjectToHoverOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsHoverController';
import type {ObjectToPointerdownOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerdownController';
import type {ObjectToPointerupOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerupController';
import type {ObjectToSwipeOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsSwipeController';

export class addObjectToClickCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToHoverOptions]> {
	static override type() {
		return 'addObjectToClickCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToHoverOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionClick;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToContextmenuCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToContextmenuOptions]> {
	static override type() {
		return 'addObjectToContextmenuCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToContextmenuOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionContextmenu;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToHoveredCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToHoverOptions]> {
	static override type() {
		return 'addObjectToHoveredCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToHoverOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionHover;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToLongPressCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToContextmenuOptions]> {
	static override type() {
		return 'addObjectToLongPressCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToContextmenuOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionLongPress;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToPointerdownCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToPointerdownOptions]> {
	static override type() {
		return 'addObjectToPointerdownCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToPointerdownOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionPointerdown;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}
export class addObjectToPointerupCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToPointerupOptions]> {
	static override type() {
		return 'addObjectToPointerupCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToPointerupOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionPointerup;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToSwipeCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToSwipeOptions]> {
	static override type() {
		return 'addObjectToSwipeCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToSwipeOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionSwipe;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}
