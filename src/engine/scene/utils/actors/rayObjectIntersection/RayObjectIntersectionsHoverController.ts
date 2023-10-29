import type {Ref} from '@vue/reactivity';
import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController, AddObjectOptions, PriorityOptions, CPUOptions, GPUOptions} from './_BaseRayObjectIntersectionsController';

interface HoveredOptions {
	hoveredStateRef: Ref<boolean>;
	onHoveredStateChange: () => void;
}
export interface AddObjectToHoverOptions extends AddObjectOptions {
	hover: HoveredOptions
}
export interface AddObjectToHoverOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	hover: ConvertToStrings<HoveredOptions>
}

export class RayObjectIntersectionsHoverController extends BaseRayObjectIntersectionsController {
	protected override _propertiesByObject: WeakMap<Object3D, AddObjectToHoverOptions> = new WeakMap();

	process() {
		this._preProcess();
	
		const objects = this._objects;

		for (const object of objects) {
			const properties = this._propertiesByObject.get(object);
			if (properties) {
				const currentHoveredState = properties.hover.hoveredStateRef.value;
				const newHoveredState = this._intersectedStateByObject.get(object) || false;
				if (newHoveredState != currentHoveredState) {
					properties.hover.hoveredStateRef.value = newHoveredState;
					properties.hover.onHoveredStateChange();
				}
			}
		}

		this._postProcess();
	}
}
