import {Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';
import {pushOnArrayAtEntry} from '../../../../../core/MapUtils';

interface LongPressOptions {
	duration: number;
	callback: () => void;
}
export interface ObjectToLongPressOptions extends ObjectOptions {
	longPress: LongPressOptions;
}
export interface ObjectToLongPressOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	longPress: ConvertToStrings<LongPressOptions>;
}
export const DEFAULT_LONG_PRESS_DURATION = 500;

export class RayObjectIntersectionsLongPressController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToLongPressOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnTimeoutByObject: Map<Object3D, boolean> = new Map();
	protected _objectsByLongPressDuration: Map<number, Object3D[]> = new Map();
	private _timerByDuration: Map<number, number> = new Map();

	private _bound = {
		pointerup: this._onPointerup.bind(this),
	};
	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		if (this._objects.length == 0) {
			return;
		}
		document.addEventListener('pointerup', this._bound.pointerup);

		this._objectsByLongPressDuration.clear();
		this._timerByDuration.clear();
		this._setIntersectedState(this._objects, this._intersectedStateOnPointerdownByObject);

		const _groupIntersectedObjectsByDuration = () => {
			const objects = this._objects;

			for (const object of objects) {
				const propertiesList = this._propertiesListByObject.get(object);
				if (propertiesList) {
					const isIntersecting = this._intersectedStateOnPointerdownByObject.get(object);
					if (isIntersecting == true) {
						for (const properties of propertiesList) {
							pushOnArrayAtEntry(this._objectsByLongPressDuration, properties.longPress.duration, object);
						}
					}
				}
			}
		};
		_groupIntersectedObjectsByDuration();

		this._objectsByLongPressDuration.forEach((objects, duration) => {
			const wrappedTriggeredMethod = () => {
				this._timerByDuration.delete(duration);
				this._setIntersectedState(this._objects, this._intersectedStateOnTimeoutByObject);
				for (const object of objects) {
					const propertiesList = this._propertiesListByObject.get(object);
					if (propertiesList) {
						const isIntersecting = this._intersectedStateOnTimeoutByObject.get(object);
						if (isIntersecting) {
							for (const properties of propertiesList) {
								properties.longPress.callback();
							}
						}
					}
				}
			};
			const timer = setTimeout(wrappedTriggeredMethod, duration) as any as number;

			this._timerByDuration.set(duration, timer);
		});
	}
	private _onPointerup(event: PointerEvent) {
		document.removeEventListener('pointerup', this._bound.pointerup);
		this._timerByDuration.forEach((timer, duration) => {
			clearTimeout(timer);
		});
		this._timerByDuration.clear();
	}
}
