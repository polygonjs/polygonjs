import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {
	BaseRayObjectIntersectionsController,
} from './_BaseRayObjectIntersectionsController';
import {
	ObjectOptions,
	GPUOptions,
	CPUOptions,
	PriorityOptions,
} from './Common';

interface ContextmenuOptions {
	callback: () => void;
}
export interface ObjectToContextmenuOptions extends ObjectOptions {
	contextmenu: ContextmenuOptions;
}
export interface ObjectToContextmenuOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	contextmenu: ConvertToStrings<ContextmenuOptions>;
}

export class RayObjectIntersectionsContextmenuController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToContextmenuOptions[]> = new Map();
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();

	onContextmenu(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		this._setIntersectedState(this._objects, this._intersectedStateByObject);

		const objects = this._objects;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersecting = this._intersectedStateByObject.get(object);
				if (isIntersecting == true) {
					for(const properties of propertiesList){
						properties.contextmenu.callback();
					}
				}
			}
		}
	}
}
