// shared by ALL objects
// shared between 2 triggers nodes depending on it
// function getSin(object){
// 	return Math.sin(time)
// }

import {Object3D} from 'three';
import {PolyScene} from '../../../../../scene/PolyScene';
import {JsType} from '../../../../../poly/registers/nodes/types/Js';
import {EventData} from '../../../../../../core/event/EventData';
// import {ref} from '../../../../../../core/reactivity';

// // updateObjectPosition
// function runUpdatePosition(object){

// 	object.position.y = getSin(object)
// 	object.updateMatrix();

// 	// fire trigger
// 	runUpdatePosition(object)
// }

// // updateObjectRotation
// function runUpdateRotation(object){

// 	object.rotation.y = getSin(object)
// 	object.updateMatrix();
// }

//////////////
// import {Ref, ref, computed} from '@vue/reactivity';
// import {Vector3, Object3D} from 'three';
// import {PolyScene} from '../../../../../scene/PolyScene';
// import {ActorNodeTriggerContext} from '../../../../actor/_Base';
// const _v3 = new Vector3();
// export class JsActorEvaluator {
// 	public globalsTime = ref(0);
// 	public targetObject: Ref<Object3D | null> = ref(null);
// 	// public sinNodeValue = computed(()=>Math.sin(globalsTime.value)); // only depends on time
// 	public sinNodePos = computed(() => {
// 		// _var.y = sinNodeValue.value;
// 		const globalsTime = this.scene.timeController.timeUniform();
// 		_v3.y = Math.sin(globalsTime.value); // only depends on time
// 		return _v3;
// 	});
// 	// public getMaterial = computed(()=> ... )// depends on a string
// 	constructor(private scene: PolyScene) {}

// 	// time could be a reactive element inside the timeController
// 	triggerOnTick(context: ActorNodeTriggerContext) {
// 		const Object3D = this.targetObject.value!;
// 		this.targetObject.value = Object3D;

// 		//
// 		Object3D.position.copy(this.sinNodePos.value);
// 		// object.updateMatrix(); // not generated?

// 		this.trigger2(context);
// 	}
// 	trigger2(context: ActorNodeTriggerContext) {
// 		const Object3D = this.targetObject.value!;
// 		this.targetObject.value = Object3D; // does not trigger a change

// 		Object3D.rotation.setFromVector3(this.sinNodePos.value);
// 		Object3D.updateMatrix();
// 	}
// }
export interface EvaluationContext {
	Object3D: Object3D;
}
type TriggerCallback = () => void;

export type EvaluatorMethodName =
	| JsType.ON_MANUAL_TRIGGER
	| JsType.ON_MAPBOX_CAMERA_MOVE
	| JsType.ON_MAPBOX_CAMERA_MOVE_START
	| JsType.ON_MAPBOX_CAMERA_MOVE_END
	| JsType.ON_OBJECT_CLICK
	| JsType.ON_OBJECT_HOVER
	| JsType.ON_PERFORMANCE_CHANGE
	| JsType.ON_SCENE_PLAY_STATE
	| JsType.ON_SCENE_RESET
	| JsType.ON_TICK;
export const EVALUATOR_METHOD_NAMES: Array<EvaluatorMethodName> = [
	JsType.ON_MANUAL_TRIGGER,
	JsType.ON_MAPBOX_CAMERA_MOVE,
	JsType.ON_MAPBOX_CAMERA_MOVE_START,
	JsType.ON_MAPBOX_CAMERA_MOVE_END,
	JsType.ON_OBJECT_CLICK,
	JsType.ON_OBJECT_HOVER,
	JsType.ON_PERFORMANCE_CHANGE,
	JsType.ON_SCENE_PLAY_STATE,
	JsType.ON_SCENE_RESET,
	JsType.ON_TICK,
];

export interface EvaluatorEventData extends EventData {
	jsType: JsType;
}

export class ActorEvaluator {
	// protected _context: EvaluationContext;
	constructor(public readonly scene: PolyScene, public readonly object3D: Object3D) {
		// this._context = {
		// Object3D: this.scene.threejsScene(),
		// };
	}
	//
	// objectUuid = ref('');
	// context() {
	// 	return this._context;
	// }
	// eventDatas?: Set<EvaluatorEventData>;
	//
	onManualTrigger?: TriggerCallback;
	onMapboxCameraMove?: TriggerCallback;
	onMapboxCameraMoveStart?: TriggerCallback;
	onMapboxCameraMoveEnd?: TriggerCallback;
	onObjectClick?: TriggerCallback;
	onObjectHover?: TriggerCallback;
	onPerformanceChange?: TriggerCallback;
	onScenePlayState?: TriggerCallback;
	onSceneReset?: TriggerCallback;
	onTick?: TriggerCallback;
}

export enum EvaluatorConstant {
	OBJECT_3D = 'this.object3D',
	SCENE = 'this.scene',
}