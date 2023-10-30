import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';

interface PointerupOptions {
	callback: () => void;
}
export interface ObjectToPointerupOptions extends ObjectOptions {
	pointerup: PointerupOptions;
}
export interface ObjectToPointerupOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	pointerup: ConvertToStrings<PointerupOptions>;
}

export class RayObjectIntersectionsPointerupController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToPointerupOptions[]> = new Map();
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();

	// private _processBound = this._process.bind(this);
	onPointerup(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		this._setIntersectedState(this._objects, this._intersectedStateByObject);

		const objects = this._objects;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersecting = this._intersectedStateByObject.get(object);
				if (isIntersecting == true) {
					for (const properties of propertiesList) {
						properties.pointerup.callback();
					}
				}
			}
		}
	}
}
