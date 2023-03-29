import {Object3D} from 'three';
import {CoreObject} from '../../core/geometry/Object';
import {touchObjectAttribute} from './GetObjectAttribute';
import {ObjectNamedFunction3} from './_Base';

export class setObjectAttribute extends ObjectNamedFunction3<[string, number, any]> {
	static override type() {
		return 'setObjectAttribute';
	}
	func(object3D: Object3D, attribName: string, lerp: number, newValue: any): void {
		CoreObject.setAttribute(object3D, attribName, newValue);
		touchObjectAttribute(object3D, attribName);
	}
}
