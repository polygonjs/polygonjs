import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {
	BaseRayObjectIntersectionsController,
	AddObjectOptions,
	GPUOptions,
	CPUOptions,
	PriorityOptions,
} from './_BaseRayObjectIntersectionsController';

interface PointerdownOptions {
	callback: () => void;
}
export interface AddObjectToPointerdownOptions extends AddObjectOptions {
	pointerdown: PointerdownOptions;
}
export interface AddObjectToPointerdownOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	pointerdown: ConvertToStrings<PointerdownOptions>;
}

export class RayObjectIntersectionsPointerdownController extends BaseRayObjectIntersectionsController {
	protected override _propertiesByObject: WeakMap<Object3D, AddObjectToPointerdownOptions> = new WeakMap();

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
					properties.pointerdown.callback();
				}
			}
		}

		// reset
		this._postProcess();
	}

	override addObject(object: Object3D, properties: AddObjectToPointerdownOptions) {
		super.addObject(object, properties);
		this._setEvent();
	}
	override removeObject(object: Object3D) {
		super.removeObject(object);
		this._setEvent();
	}
	private _setEvent() {
		if (this._objects.length > 0) {
			document.addEventListener('pointerdown', this._processBound);
		} else {
			document.removeEventListener('pointerdown', this._processBound);
		}
	}
}
