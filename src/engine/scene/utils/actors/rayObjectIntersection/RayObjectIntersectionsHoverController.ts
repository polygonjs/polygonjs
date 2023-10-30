import type {Ref} from '@vue/reactivity';
import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';

interface HoveredOptions {
	hoveredStateRef: Ref<boolean>;
	onHoveredStateChange: () => void;
}
export interface ObjectToHoverOptions extends ObjectOptions {
	hover: HoveredOptions;
}
export interface ObjectToHoverOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	hover: ConvertToStrings<HoveredOptions>;
}

export class RayObjectIntersectionsHoverController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToHoverOptions[]> = new Map();
	protected _intersectedStateByObject: Map<Object3D, boolean> = new Map();

	process() {
		this._setIntersectedState(this._objects, this._intersectedStateByObject);

		const objects = this._objects;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				for (const properties of propertiesList) {
					const currentHoveredState = properties.hover.hoveredStateRef.value;
					const newHoveredState = this._intersectedStateByObject.get(object) || false;
					if (newHoveredState != currentHoveredState) {
						properties.hover.hoveredStateRef.value = newHoveredState;
						properties.hover.onHoveredStateChange();
					}
				}
			}
		}
	}
}
