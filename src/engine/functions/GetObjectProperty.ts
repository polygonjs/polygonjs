import {Mesh, Object3D} from 'three';
import {ObjectNamedFunction1} from './_Base';
import {getObjectPropertyRef, PropertyType} from '../../core/reactivity/ObjectPropertyReactivity';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';

export class getObjectProperty extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectProperty';
	}
	func<K extends keyof PropertyType>(object3D: Object3D, propertyName: K): PropertyType[K] {
		dummyReadRefVal(getObjectPropertyRef(object3D, propertyName).value);
		return (object3D as Mesh)[propertyName] as PropertyType[K];
	}
}
