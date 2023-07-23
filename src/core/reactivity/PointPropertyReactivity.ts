import {Object3D} from 'three';
import {Ref, ref} from '@vue/reactivity';

export enum GetPointPropertyJsNodeInputName {
	ptnum = 'ptnum',
	position = 'position',
}

const ptnumRefByObjectUuid: Map<string, Ref<number>> = new Map();
export function getObjectPtnumRef(object3D: Object3D) {
	let _ref = ptnumRefByObjectUuid.get(object3D.uuid);
	if (!_ref) {
		_ref = ref(-1);
		ptnumRefByObjectUuid.set(object3D.uuid, _ref);
	}

	return _ref;
}
