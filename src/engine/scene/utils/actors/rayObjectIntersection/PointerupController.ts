import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseUserInputController} from './_BaseUserInputController';

interface PointerupOptions {
	callback: () => void;
}
export interface ObjectToPointerupOptions {
	pointerup: PointerupOptions;
}
export interface ObjectToPointerupOptionsAsString {
	pointerup: ConvertToStrings<PointerupOptions>;
}

export class PointerupController extends BaseUserInputController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToPointerupOptions[]> = new Map();
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();

	onPointerup(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		const objects = this._objects;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				for (const properties of propertiesList) {
					properties.pointerup.callback();
				}
			}
		}
	}
}
