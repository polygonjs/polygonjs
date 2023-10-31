import {Object3D, Vector2} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';

interface ClickOptions {
	maxCursorMoveDistance: number;
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
const _cursorDelta = new Vector2();
const _lastCursorPos = new Vector2();
const _currentCursorPos = new Vector2();

function hasPropertiesWithCursorMoveLessThan(options: ObjectToClickOptions[], distance: number) {
	for (const option of options) {
		if (distance < option.click.maxCursorMoveDistance) {
			return true;
		}
	}
	return false;
}
export const DEFAULT_MAX_CURSOR_MOVE_DISTANCE = 0.05;

export class RayObjectIntersectionsClickController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToClickOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnPointerupByObject: Map<Object3D, boolean> = new Map();
	private _objectsIntersectedOnPointerdown: Object3D[] = [];
	private _lastCursorPosSet = false;
	private _movedCursorDistance = 0;

	private _bound = {
		pointerup: this._onPointerup.bind(this),
		pointermove: this._onPointermove.bind(this),
	};
	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		if (this._objects.length == 0) {
			return;
		}
		this._movedCursorDistance = 0;
		this._lastCursorPosSet = false;
		document.addEventListener('pointerup', this._bound.pointerup);
		document.addEventListener('pointermove', this._bound.pointermove);
		this._setIntersectedState(this._objects, this._intersectedStateOnPointerdownByObject);
	}
	private _onPointermove(event: PointerEvent) {
		const pointerEventsController = this._scene.eventsDispatcher.pointerEventsController;
		const cursor = pointerEventsController.cursor().value;
		if (this._lastCursorPosSet == false) {
			_lastCursorPos.copy(cursor);
			this._lastCursorPosSet = true;
		}
		_currentCursorPos.copy(cursor);
		_cursorDelta.copy(_currentCursorPos).sub(_lastCursorPos);
		// we divide by 2 because the cursor is in the [-1,1] range
		// and covering the whole screen would give a length of 2.
		// But it's easier to think in term of [0,1] range
		this._movedCursorDistance += _cursorDelta.manhattanLength() / 2;
		_lastCursorPos.copy(_currentCursorPos);
	}
	private _onPointerup(event: PointerEvent) {
		document.removeEventListener('pointerup', this._bound.pointerup);
		document.removeEventListener('pointermove', this._bound.pointermove);

		const objects = this._objects;
		this._objectsIntersectedOnPointerdown.length = 0;

		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList && hasPropertiesWithCursorMoveLessThan(propertiesList, this._movedCursorDistance)) {
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
		this._setIntersectedState(objects, this._intersectedStateOnPointerupByObject);

		const objectsIntersectedOnPointerdown = this._objectsIntersectedOnPointerdown;
		for (const object of objectsIntersectedOnPointerdown) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnPointerup = this._intersectedStateOnPointerupByObject.get(object);
				if (isIntersectingOnPointerup == true) {
					for (const properties of propertiesList) {
						if (this._movedCursorDistance < properties.click.maxCursorMoveDistance) {
							properties.click.callback();
						}
					}
				}
			}
		}
	}
}
