import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseUserInputController} from './_BaseUserInputController';

interface PointerdownOptions {
	callback: () => void;
}
export interface ObjectToPointerdownOptions {
	pointerdown: PointerdownOptions;
}
export interface ObjectToPointerdownOptionsAsString {
	pointerdown: ConvertToStrings<PointerdownOptions>;
}

export class PointerdownController extends BaseUserInputController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToPointerdownOptions[]> = new Map();
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();

	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		const objects = this._objects;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				for (const properties of propertiesList) {
					properties.pointerdown.callback();
				}
			}
		}
	}
}
