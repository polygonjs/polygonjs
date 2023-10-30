import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';

interface PointerdownOptions {
	callback: () => void;
}
export interface ObjectToPointerdownOptions extends ObjectOptions {
	pointerdown: PointerdownOptions;
}
export interface ObjectToPointerdownOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	pointerdown: ConvertToStrings<PointerdownOptions>;
}

export class RayObjectIntersectionsPointerdownController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToPointerdownOptions[]> = new Map();
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();

	// private _processBound = this._process.bind(this);
	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		this._setIntersectedState(this._objects, this._intersectedStateByObject);

		const objects = this._objects;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersecting = this._intersectedStateByObject.get(object);
				if (isIntersecting == true) {
					for (const properties of propertiesList) {
						properties.pointerdown.callback();
					}
				}
			}
		}
	}

	// protected override _setEvent() {
	// 	console.log('_setEvent', this._objects.length);
	// 	if (this._objects.length > 0) {
	// 		document.addEventListener('pointerdown', this._processBound);
	// 	} else {
	// 		document.removeEventListener('pointerdown', this._processBound);
	// 	}
	// }
}
