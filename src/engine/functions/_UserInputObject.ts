import type {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
import type {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import type {
	ObjectToContextmenuOptions,
	RayObjectIntersectionsContextmenuController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsContextmenuController';
import type {
	ObjectToClickOptions,
	RayObjectIntersectionsClickController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsClickController';
import type {
	ObjectToMouseClickOptions,
	RayObjectIntersectionsMouseClickController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsMouseClickController';
import type {
	ObjectToHoverOptions,
	RayObjectIntersectionsHoverController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsHoverController';
import type {
	ObjectToObjectPointerdownOptions,
	RayObjectIntersectionsPointerdownController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerdownController';
import type {
	ObjectToObjectPointerupOptions,
	RayObjectIntersectionsPointerupController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsPointerupController';
import type {
	ObjectToSwipeOptions,
	RayObjectIntersectionsSwipeController,
} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsSwipeController';
import {Poly} from '../Poly';
import type {RayObjectIntersectionsDoubleClickController} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsDoubleClickController';
import type {RayObjectIntersectionsLongPressController} from '../scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsLongPressController';

type AvailableController =
	| RayObjectIntersectionsClickController
	| RayObjectIntersectionsDoubleClickController
	| RayObjectIntersectionsMouseClickController
	| RayObjectIntersectionsContextmenuController
	| RayObjectIntersectionsHoverController
	| RayObjectIntersectionsLongPressController
	| RayObjectIntersectionsPointerdownController
	| RayObjectIntersectionsPointerupController
	| RayObjectIntersectionsSwipeController;
type AvailableOoptions =
	| ObjectToClickOptions
	| ObjectToMouseClickOptions
	| ObjectToContextmenuOptions
	| ObjectToHoverOptions
	| ObjectToObjectPointerdownOptions
	| ObjectToObjectPointerupOptions
	| ObjectToSwipeOptions;
interface SetupObject {
	object3D: Object3D;
	evaluator: ActorEvaluator;
	controller: AvailableController;
	options: AvailableOoptions;
}
function setup(setupOptions: SetupObject) {
	const {controller, object3D, evaluator, options} = setupOptions;
	controller.addPropertiesForObject(object3D, options);

	evaluator.onDispose(() => {
		controller.removePropertiesForObject(object3D, options);
	});

	Poly.onObjectsAddRemoveHooks.assignOnRemoveHookCallback(object3D, (object) => {
		controller.removePropertiesForObject(object3D, options);
	});
}
export class addObjectToObjectClickCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToClickOptions]> {
	static override type() {
		return 'addObjectToObjectClickCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToClickOptions) {
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionClick,
		});
	}
}
export class addObjectToObjectDoubleClickCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToClickOptions]> {
	static override type() {
		return 'addObjectToObjectDoubleClickCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToClickOptions) {
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionDoubleClick,
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
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionMouseClick,
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
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionContextmenu,
		});
	}
}

export class addObjectToObjectHoveredCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToHoverOptions]> {
	static override type() {
		return 'addObjectToObjectHoveredCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToHoverOptions) {
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionHover,
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
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionLongPress,
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
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionPointerdown,
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
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionPointerup,
		});
	}
}

export class addObjectToObjectSwipeCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToSwipeOptions]> {
	static override type() {
		return 'addObjectToObjectSwipeCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToSwipeOptions) {
		setup({
			object3D,
			evaluator,
			options,
			controller: this.scene.actorsManager.rayObjectIntersectionSwipe,
		});
	}
}
