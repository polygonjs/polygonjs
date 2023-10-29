import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController, AddObjectOptions, PriorityOptions, CPUOptions, GPUOptions} from './_BaseRayObjectIntersectionsController';

interface PointerupOptions {
	callback: () => void;
}
export interface AddObjectToPointerupOptions extends AddObjectOptions {
	pointerup: PointerupOptions;
}
export interface AddObjectToPointerupOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	pointerup: ConvertToStrings<PointerupOptions>
}

export class RayObjectIntersectionsPointerupController extends BaseRayObjectIntersectionsController {
	protected override _propertiesByObject: WeakMap<Object3D, AddObjectToPointerupOptions> = new WeakMap();

	private _processBound = this._process.bind(this);
	private _process() {
		this._preProcess();

		const objects = this._objects;

		// commit new hovered state
		for (const object of objects) {
			const properties = this._propertiesByObject.get(object);
			if (properties) {
				const isIntersecting = this._intersectedStateByObject.get(object);
				if (isIntersecting == true) {
					properties.pointerup.callback();
				}
			}
		}

		// reset
		this._postProcess();
	}

	override addObject(object: Object3D, properties: AddObjectToPointerupOptions) {
		super.addObject(object, properties);
		this._setEvent();
	}
	override removeObject(object: Object3D) {
		super.removeObject(object);
		this._setEvent();
	}
	private _setEvent() {
		if (this._objects.length > 0) {
			document.addEventListener('pointerup', this._processBound);
		} else {
			document.removeEventListener('pointerup', this._processBound);
		}
	}
}
