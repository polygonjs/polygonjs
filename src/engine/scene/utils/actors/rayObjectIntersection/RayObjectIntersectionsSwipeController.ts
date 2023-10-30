import {Object3D, Vector2} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {radToDeg} from '../../../../../core/math/_Module';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';

interface SwipeOptions {
	angle: number;
	angleMargin: number;
	callback: () => void;
}
export interface ObjectToSwipeOptions extends ObjectOptions {
	swipe: SwipeOptions;
}
export interface ObjectToSwipeOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	swipe: ConvertToStrings<SwipeOptions>;
}

const _tmp = new Vector2();
function degAngle(radians: number) {
	if (radians > Math.PI) {
		radians -= Math.PI * 2;
	}
	return radToDeg(radians);
}
export const ANGLE_DEGREES = {
	LEFT: degAngle(_tmp.set(-1, 0).angle()),
	RIGHT: degAngle(_tmp.set(1, 0).angle()),
	UP: degAngle(_tmp.set(0, 1).angle()),
	DOWN: degAngle(_tmp.set(0, -1).angle()),
};

function optionsContainsAngle(options: SwipeOptions, angle: number) {
	return angle >= options.angle - options.angleMargin && angle <= options.angle + options.angleMargin;
}

export class RayObjectIntersectionsSwipeController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToSwipeOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnPointerupByObject: Map<Object3D, boolean> = new Map();
	private _objectsIntersectedOnPointerdown: Object3D[] = [];
	private _cursorOnPointerdown = new Vector2();
	private _cursorOnPointerup = new Vector2();
	private _cursorDelta = new Vector2();

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
		this._getCursor(this._cursorOnPointerdown);
	}
	private _onPointerup(event: PointerEvent) {
		document.removeEventListener('pointerup', this._bound.pointerup);

		const objects = this._objects;
		this._objectsIntersectedOnPointerdown.length = 0;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnPointerdown = this._intersectedStateOnPointerdownByObject.get(object);
				if (isIntersectingOnPointerdown) {
					this._objectsIntersectedOnPointerdown.push(object);
				}
			}
		}

		// I've considered using only the objects intersected in pointerdown for the pointerup detection,
		// but that prevents missed objects from occluding others if they are in front.
		// We therefore need to run the detection on all objects
		// instead, we can still optimise by not detecting anything if that list is empty
		if (this._objectsIntersectedOnPointerdown.length == 0) {
			return;
		}

		// check swipe angle
		this._getCursor(this._cursorOnPointerup);
		this._cursorDelta.copy(this._cursorOnPointerup).sub(this._cursorOnPointerdown);
		let radians = this._cursorDelta.angle();
		const degrees = degAngle(radians);

		//
		this._setIntersectedState(objects, this._intersectedStateOnPointerupByObject);
		const objectsIntersectedOnPointerdown = this._objectsIntersectedOnPointerdown;
		for (const object of objectsIntersectedOnPointerdown) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnPointerup = this._intersectedStateOnPointerupByObject.get(object);
				if (isIntersectingOnPointerup == true) {
					for (const properties of propertiesList) {
						if (optionsContainsAngle(properties.swipe, degrees)) {
							properties.swipe.callback();
						}
					}
				}
			}
		}
	}

	private _getCursor(target: Vector2) {
		const pointerEventsController = this._scene.eventsDispatcher.pointerEventsController;
		const cursor = pointerEventsController.cursor().value;
		target.copy(cursor);
	}
}
