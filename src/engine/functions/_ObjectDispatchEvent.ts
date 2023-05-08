import {Ref} from '@vue/reactivity';
import {Object3D} from 'three';
import {ObjectNamedFunction0, ObjectNamedFunction1, ObjectNamedFunction3} from './_Base';
import {ref} from '../../core/reactivity/CoreReactivity';
import {ActorEvaluator} from '../nodes/js/code/assemblers/actor/ActorEvaluator';

type Listener = () => void;
const EVENT = {type: ''};
const lastEventByObject: Map<Object3D, Ref<string>> = new Map();
function getOrCreateRef(object3D: Object3D) {
	return getObjectRef(object3D) || _createObjectRef(object3D);
}
function getObjectRef(object3D: Object3D) {
	return lastEventByObject.get(object3D);
}
function _createObjectRef(object3D: Object3D) {
	let _ref = lastEventByObject.get(object3D);
	if (_ref) {
		return _ref;
	}
	_ref = ref('');
	lastEventByObject.set(object3D, _ref);
	return _ref;
}
function setLastEventName(object3D: Object3D, eventName: string) {
	getOrCreateRef(object3D).value = eventName;
}
export function onObjectDispatchFunctionNameByEventName(eventName: string) {
	return `onObjectDispatchEvent_${eventName}`;
}

//
//
//
//
//
export class objectDispatchEvent extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'objectDispatchEvent';
	}
	func(object3D: Object3D, eventName: string): void {
		EVENT.type = eventName;
		object3D.dispatchEvent(EVENT);
		setLastEventName(object3D, eventName);
	}
}
export class getObjectLastDispatchedEventName extends ObjectNamedFunction0 {
	static override type() {
		return 'getObjectLastDispatchedEventName';
	}
	func(object3D: Object3D): string {
		return getOrCreateRef(object3D).value;
	}
}
export class objectAddEventListeners extends ObjectNamedFunction3<[string, ActorEvaluator, Listener]> {
	static override type() {
		return 'objectAddEventListeners';
	}
	func(object3D: Object3D, eventNamesList: string, evaluator: ActorEvaluator, boundListener: Listener): string {
		const eventNames = eventNamesList.split(' ');
		for (let eventName of eventNames) {
			if (boundListener) {
				object3D.addEventListener(eventName, boundListener);
			}
		}
		evaluator.onDispose(() => {
			for (let eventName of eventNames) {
				object3D.removeEventListener(eventName, boundListener);
			}
		});

		return getOrCreateRef(object3D).value;
	}
}
