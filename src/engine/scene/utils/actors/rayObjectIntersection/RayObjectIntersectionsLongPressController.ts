import {Object3D, Vector2} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {ObjectOptions, GPUOptions, CPUOptions, PriorityOptions} from './Common';
import {pushOnArrayAtEntry} from '../../../../../core/MapUtils';

interface LongPressOptions {
	duration: number;
	maxCursorMoveDistance: number;
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
const _cursorDelta = new Vector2();
const _lastCursorPos = new Vector2();
const _currentCursorPos = new Vector2();
export const DEFAULT_LONG_PRESS_DURATION = 500;

function hasPropertiesWithCursorMoveLessThan(options: ObjectToLongPressOptions[], distance: number) {
	for (const option of options) {
		if (distance < option.longPress.maxCursorMoveDistance) {
			return true;
		}
	}
	return false;
}
export const DEFAULT_MAX_CURSOR_MOVE_DISTANCE = 0.05;

export class RayObjectIntersectionsLongPressController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToLongPressOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnTimeoutByObject: Map<Object3D, boolean> = new Map();
	protected _objectsByLongPressDuration: Map<number, Object3D[]> = new Map();
	private _timerByDuration: Map<number, number> = new Map();
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
					if (
						propertiesList &&
						hasPropertiesWithCursorMoveLessThan(propertiesList, this._movedCursorDistance)
					) {
						const isIntersecting = this._intersectedStateOnTimeoutByObject.get(object);
						if (isIntersecting) {
							for (const properties of propertiesList) {
								if (this._movedCursorDistance < properties.longPress.maxCursorMoveDistance) {
									properties.longPress.callback();
								}
							}
						}
					}
				}
			};
			const timer = setTimeout(wrappedTriggeredMethod, duration) as any as number;

			this._timerByDuration.set(duration, timer);
		});
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
		this._timerByDuration.forEach((timer, duration) => {
			clearTimeout(timer);
		});
		this._timerByDuration.clear();
	}
}
