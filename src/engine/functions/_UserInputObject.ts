import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import type {ObjectToContextmenuOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsContextmenuController';
import type {ObjectToClickOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsClickController';
import type {ObjectToMouseClickOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsMouseClickController';
import type {ObjectToHoverOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsHoverController';
import type {ObjectToObjectPointerdownOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerdownController';
import type {ObjectToObjectPointerupOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerupController';
import type {ObjectToSwipeOptions} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsSwipeController';

export class addObjectToObjectClickCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToClickOptions]> {
	static override type() {
		return 'addObjectToObjectClickCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToClickOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionClick;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}
export class addObjectToObjectMouseClickCheck extends ObjectNamedFunction2<
	[ActorEvaluator, ObjectToMouseClickOptions]
> {
	static override type() {
		return 'addObjectToObjectMouseClickCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToMouseClickOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionMouseClick;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToObjectContextmenuCheck extends ObjectNamedFunction2<
	[ActorEvaluator, ObjectToContextmenuOptions]
> {
	static override type() {
		return 'addObjectToObjectContextmenuCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToContextmenuOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionContextmenu;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToObjectHoveredCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToHoverOptions]> {
	static override type() {
		return 'addObjectToObjectHoveredCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToHoverOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionHover;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToObjectLongPressCheck extends ObjectNamedFunction2<
	[ActorEvaluator, ObjectToContextmenuOptions]
> {
	static override type() {
		return 'addObjectToObjectLongPressCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToContextmenuOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionLongPress;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToObjectPointerdownCheck extends ObjectNamedFunction2<
	[ActorEvaluator, ObjectToObjectPointerdownOptions]
> {
	static override type() {
		return 'addObjectToObjectPointerdownCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToObjectPointerdownOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionPointerdown;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}
export class addObjectToObjectPointerupCheck extends ObjectNamedFunction2<
	[ActorEvaluator, ObjectToObjectPointerupOptions]
> {
	static override type() {
		return 'addObjectToObjectPointerupCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToObjectPointerupOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionPointerup;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}

export class addObjectToObjectSwipeCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToSwipeOptions]> {
	static override type() {
		return 'addObjectToObjectSwipeCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToSwipeOptions) {
		const controller = this.scene.actorsManager.rayObjectIntersectionSwipe;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}
