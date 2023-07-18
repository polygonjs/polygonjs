import {Ref} from '@vue/reactivity';
import {ref} from '../../core/reactivity/CoreReactivity';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';

const refChildrenCountByUuid: WeakMap<ObjectContent<CoreObjectType>, Ref<number>> = new WeakMap();
export function getObjectChildrenCountRef(object: ObjectContent<CoreObjectType>) {
	let _ref = refChildrenCountByUuid.get(object);
	if (!_ref) {
		_ref = ref(object.children.length);
		refChildrenCountByUuid.set(object, _ref);
	}
	return _ref;
}

export function updateObjectChildrenCountRef(object: ObjectContent<CoreObjectType>) {
	getObjectChildrenCountRef(object).value = object.children.length;
}
