// import {ref} from './CoreReactivity';
import type {Ref} from '@vue/reactivity';
// import type{ Vector2} from 'three';
// import { ParamConvertibleJsType} from '../../engine/nodes/utils/io/connections/Js';

import type {AttribValue} from '../../types/GlobalTypes';

import type {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {JsIConnectionPointTypeToDataTypeMap, ParamConvertibleJsType} from '../../engine/nodes/utils/io/connections/Js';

export interface AttribRefs<T extends ParamConvertibleJsType> {
	current: Ref<JsIConnectionPointTypeToDataTypeMap[T]>;
	previous: Ref<JsIConnectionPointTypeToDataTypeMap[T]>;
}

export type ObjectXD = ObjectContent<CoreObjectType>;
export const refByObjectUuidByAttribName: WeakMap<
	ObjectXD,
	Map<string, AttribRefs<ParamConvertibleJsType>>
> = new WeakMap();

export function _getObjectAttributeRef_(
	object3D: ObjectXD,
	attribName: string
	// type: ParamConvertibleJsType
): AttribRefs<ParamConvertibleJsType> | undefined {
	return refByObjectUuidByAttribName.get(object3D)?.get(attribName);
}

// export function _getOrCreateObjectAttributeRef(
// 	object3D: ObjectXD,
// 	attribName: string,
// 	type: ParamConvertibleJsType
// ): AttribRefs {
// 	let mapForObject = refByObjectUuidByAttribName.get(object3D);
// 	if (!mapForObject) {
// 		mapForObject = new Map();
// 		refByObjectUuidByAttribName.set(object3D, mapForObject);
// 	}
// 	let refForAttribName = mapForObject.get(attribName);
// 	if (!refForAttribName) {
// 		let _defaultValue = defaultValue(type);
// 		let _previousValue = defaultValue(type);
// 		const currentValue = CoreObject.attribValue(object3D, attribName, 0, _defaultValue as any as Vector2);
// 		const previousValue = CoreObject.attribValue(object3D, attribName, 0, _previousValue as any as Vector2);
// 		if (currentValue == null || previousValue == null) {
// 			refForAttribName = {
// 				current: ref(defaultValue(type)),
// 				previous: ref(defaultValue(type)),
// 			};
// 		} else {
// 			refForAttribName = {
// 				current: ref(currentValue),
// 				previous: ref(previousValue),
// 			};
// 		}
// 		mapForObject.set(attribName, refForAttribName);
// 	}
// 	return refForAttribName;
// }
export function _dummyReadAttributeRefVal(value: AttribValue) {
	// 	// console.log('_dummyReadAttributeRefVal', value);
	// 	// we just need this method to force a call to .value
	// 	// and ensure that we have a dependency with the ref()
}

// export function touchObjectAttribute(object3D: Object3D, attribName: string) {
// 	// const _ref = _getObjectAttributeRef(object3D, attribName);
// 	// incrementRefSafely(_ref);
// }
