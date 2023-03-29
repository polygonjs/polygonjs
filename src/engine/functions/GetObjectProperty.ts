import {Mesh, Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {
	getObjectPropertyRef,
	PropertyType,
	_dummyReadPropertyRefVal,
} from '../../core/reactivity/ObjectPropertyReactivity';

export class getObjectProperty extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectProperty';
	}
	func<K extends keyof PropertyType>(object3D: Object3D, propertyName: K): PropertyType[K] {
		const _ref = getObjectPropertyRef(object3D, propertyName);
		_dummyReadPropertyRefVal(_ref.value);
		return (object3D as Mesh)[propertyName] as PropertyType[K];
	}
}
