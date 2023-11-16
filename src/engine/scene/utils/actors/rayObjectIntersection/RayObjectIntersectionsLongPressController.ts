import {Object3D} from 'three';
import {Constructor, ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {
	ObjectOptions,
	GPUOptions,
	CPUOptions,
	PriorityOptions,
	ButtonAndModifierOptions,
	ButtonAndModifierOptionsAsString,
	filterObjectsWithMatchButtonConfig,
	ButtonConfig,
	buttonConfigFromEvent,
	propertyMatchesButtonConfig,
} from './Common';
import {pushOnArrayAtEntry} from '../../../../../core/MapUtils';
import {ParamConfig} from '../../../../nodes/utils/params/ParamsConfig';
import {MouseButton} from '../../../../../core/MouseButton';
import {CursorMoveMonitor} from '../../../../../core/CursorMoveMonitor';

interface LongPressOptions {
	duration: number;
	maxCursorMoveDistance: number;
	callback: () => void;
}
export interface ObjectToLongPressOptions extends ObjectOptions {
	longPress: LongPressOptions;
	config: ButtonAndModifierOptions;
}
export interface ObjectToLongPressOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	longPress: ConvertToStrings<LongPressOptions>;
	config: ButtonAndModifierOptionsAsString;
}
const _buttonConfig: ButtonConfig = {button: MouseButton.LEFT, ctrl: false, shift: false, alt: false};
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

export function LongPressParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param press duration (in milliseconds) */
		duration = ParamConfig.INTEGER(DEFAULT_LONG_PRESS_DURATION, {
			range: [0, 1000],
			rangeLocked: [true, false],
		});
		/** @param max cursor move distance */
		maxCursorMoveDistance = ParamConfig.FLOAT(DEFAULT_MAX_CURSOR_MOVE_DISTANCE, {
			range: [0, 1],
			rangeLocked: [true, false],
		});
	};
}

export class RayObjectIntersectionsLongPressController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToLongPressOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnTimeoutByObject: Map<Object3D, boolean> = new Map();
	private _objectsMatchingEventConfig: Object3D[] = [];
	protected _objectsByLongPressDuration: Map<number, Object3D[]> = new Map();
	private _timerByDuration: Map<number, number> = new Map();
	private _cursorMoveMonitor = new CursorMoveMonitor();

	private _bound = {
		pointerup: this._onPointerup.bind(this),
		// pointermove: this._onPointermove.bind(this),
	};
	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		if (this._objects.length == 0) {
			return;
		}
		filterObjectsWithMatchButtonConfig(
			event,
			this._objects,
			this._propertiesListByObject,
			this._objectsMatchingEventConfig
		);
		if (this._objectsMatchingEventConfig.length == 0) {
			return;
		}

		document.addEventListener('pointerup', this._bound.pointerup);
		// we also need touchend, as pointerup appears to not be triggered if the cursor has moved a little bit
		document.addEventListener('touchend', this._bound.pointerup);
		this._cursorMoveMonitor.addPointermoveEventListener(
			this._scene.eventsDispatcher.pointerEventsController.cursor()
		);

		this._objectsByLongPressDuration.clear();
		this._timerByDuration.clear();
		this._setIntersectedState(this._objectsMatchingEventConfig, this._intersectedStateOnPointerdownByObject);

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
		buttonConfigFromEvent(event, _buttonConfig);

		this._objectsByLongPressDuration.forEach((objects, duration) => {
			const wrappedTriggeredMethod = () => {
				const movedCursorDistance = this._cursorMoveMonitor.movedCursorDistance();
				this._timerByDuration.delete(duration);
				this._setIntersectedState(this._objects, this._intersectedStateOnTimeoutByObject);

				for (const object of objects) {
					const propertiesList = this._propertiesListByObject.get(object);
					if (propertiesList && hasPropertiesWithCursorMoveLessThan(propertiesList, movedCursorDistance)) {
						const isIntersecting = this._intersectedStateOnTimeoutByObject.get(object);
						if (isIntersecting) {
							for (const properties of propertiesList) {
								if (
									movedCursorDistance < properties.longPress.maxCursorMoveDistance &&
									propertyMatchesButtonConfig(properties.config, _buttonConfig)
								) {
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

	private _onPointerup() {
		document.removeEventListener('pointerup', this._bound.pointerup);
		document.removeEventListener('touchend', this._bound.pointerup);
		this._cursorMoveMonitor.removeEventListener();
		this._timerByDuration.forEach((timer, duration) => {
			clearTimeout(timer);
		});
		this._timerByDuration.clear();
	}
}
