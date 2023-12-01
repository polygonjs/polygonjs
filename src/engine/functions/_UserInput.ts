import {Object3D} from 'three';
import {ObjectNamedFunction2} from './_Base';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';
import type {ObjectToPointerdownOptions} from '../scene/utils/actors/rayObjectIntersection/PointerdownController';
import type {ObjectToPointerupOptions} from '../scene/utils/actors/rayObjectIntersection/PointerupController';

export class addObjectToPointerdownCheck extends ObjectNamedFunction2<[ActorEvaluator, ObjectToPointerdownOptions]> {
	static override type() {
		return 'addObjectToPointerdownCheck';
	}
	func(object3D: Object3D, evaluator: ActorEvaluator, options: ObjectToPointerdownOptions) {
		const controller = this.scene.actorsManager.pointerdown;
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
		const controller = this.scene.actorsManager.pointerup;
		controller.addPropertiesForObject(object3D, options);

		evaluator.onDispose(() => {
			controller.removePropertiesForObject(object3D, options);
		});
	}
}
