import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';

interface ClickOptions {
	callback: () => void;
}
export interface ObjectToClickOptions extends ObjectOptions {
	click: ClickOptions;
}
export interface ObjectToClickOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	click: ConvertToStrings<ClickOptions>;
}

export class RayObjectIntersectionsClickController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToClickOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnPointerupByObject: Map<Object3D, boolean> = new Map();
	private _objectsIntersectedOnPointerdown: Object3D[] = [];

	private _bound = {
		pointerup: this._onPointerup.bind(this),
		// pointerdown: this.onPointerdown.bind(this),
	};
	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		if (this._objects.length == 0) {
			return;
		}
		document.addEventListener('pointerup', this._bound.pointerup);
		this._setIntersectedState(this._objects, this._intersectedStateOnPointerdownByObject);
	}
	private _onPointerup(event: PointerEvent) {
		document.removeEventListener('pointerup', this._bound.pointerup);

		const objects = this._objects;
		this._objectsIntersectedOnPointerdown.length = 0;

		for (const object of objects) {
			// const propertiesList = this._propertiesListByObject.get(object);
			// if (propertiesList) {
			const isIntersectingOnPointerdown = this._intersectedStateOnPointerdownByObject.get(object);
			if (isIntersectingOnPointerdown) {
				this._objectsIntersectedOnPointerdown.push(object);
			}
			// }
		}

		// I've considered using only the objects intersected in pointerdown for the pointerup detection,
		// but that prevents missed objects from occluding others if they are in front.
		// We therefore need to run the detection on all objects
		// instead, we can still optimise by not detecting anything if that list is empty
		if (this._objectsIntersectedOnPointerdown.length == 0) {
			return;
		}
		this._setIntersectedState(objects, this._intersectedStateOnPointerupByObject);

		const objectsIntersectedOnPointerdown = this._objectsIntersectedOnPointerdown;
		for (const object of objectsIntersectedOnPointerdown) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnPointerup = this._intersectedStateOnPointerupByObject.get(object);
				if (isIntersectingOnPointerup == true) {
					for (const properties of propertiesList) {
						properties.click.callback();
					}
				}
			}
		}
	}
	// protected override _setEvent() {
	// 	if (this._objects.length > 0) {
	// 		document.addEventListener('pointerdown', this._bound.pointerdown);
	// 	} else {
	// 		document.removeEventListener('pointerdown', this._bound.pointerdown);
	// 	}
	// }
}
