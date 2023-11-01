import {Object3D} from 'three';
import {Constructor, ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {
	ObjectOptions,
	GPUOptions,
	CPUOptions,
	PriorityOptions,
	ButtonAndModifierOptions,
	// ButtonAndModifierIndexOptions,
	ButtonAndModifierOptionsAsString,
	filterObjectsWithMatchEventConfig,
	propertyMatchesEventConfig,
	EventConfig,
	eventConfigFromEvent,
	// modifierIndexToModifierOptions,
} from './Common';
import {ParamConfig} from '../../../../nodes/utils/params/ParamsConfig';
import {MouseButton} from '../../../../../core/MouseButton';
import {CursorMoveMonitor} from '../../../../../core/CursorMoveMonitor';

interface ClickOptions {
	maxCursorMoveDistance: number;
	callback: () => void;
}

export interface ObjectToClickOptions extends ObjectOptions {
	click: ClickOptions;
	config: ButtonAndModifierOptions;
}
// export interface ObjectToClickIndexOptions extends ObjectOptions {
// 	click: ClickOptions;
// 	config: ButtonAndModifierIndexOptions;
// }
export interface ObjectToClickOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	click: ConvertToStrings<ClickOptions>;
	config: ButtonAndModifierOptionsAsString;
}
const _eventConfig: EventConfig = {button: MouseButton.LEFT, ctrl: false, shift: false, alt: false};

function hasPropertiesWithCursorMoveLessThan(options: ObjectToClickOptions[], distance: number) {
	for (const option of options) {
		if (distance < option.click.maxCursorMoveDistance) {
			return true;
		}
	}
	return false;
}

export function ClickParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param max cursor move distance */
		maxCursorMoveDistance = ParamConfig.FLOAT(0.05, {
			range: [0, 1],
			rangeLocked: [true, false],
		});
	};
}

export class RayObjectIntersectionsClickController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToClickOptions[]> = new Map();
	protected _intersectedStateOnPointerdownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnPointerupByObject: Map<Object3D, boolean> = new Map();
	private _objectsMatchingEventConfig: Object3D[] = [];
	private _objectsIntersectedOnPointerdown: Object3D[] = [];
	private _cursorMoveMonitor = new CursorMoveMonitor();
	private _pointerdownEvent: Readonly<PointerEvent | MouseEvent | TouchEvent> | undefined;

	private _bound = {
		pointerup: this._onPointerup.bind(this),
	};
	onPointerdown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		this._pointerdownEvent = event;
		if (this._objects.length == 0) {
			return;
		}
		filterObjectsWithMatchEventConfig(
			event,
			this._objects,
			this._propertiesListByObject,
			this._objectsMatchingEventConfig
		);
		if (this._objectsMatchingEventConfig.length == 0) {
			return;
		}
		document.addEventListener('pointerup', this._bound.pointerup);
		this._cursorMoveMonitor.addPointermoveEventListener(
			this._scene.eventsDispatcher.pointerEventsController.cursor()
		);
		this._setIntersectedState(this._objectsMatchingEventConfig, this._intersectedStateOnPointerdownByObject);
	}

	private _onPointerup() {
		document.removeEventListener('pointerup', this._bound.pointerup);
		this._cursorMoveMonitor.removeEventListener();
		const event = this._pointerdownEvent;
		if (!event) {
			return;
		}
		const movedCursorDistance = this._cursorMoveMonitor.movedCursorDistance();

		const objects = this._objectsMatchingEventConfig;
		this._objectsIntersectedOnPointerdown.length = 0;
		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList && hasPropertiesWithCursorMoveLessThan(propertiesList, movedCursorDistance)) {
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
		eventConfigFromEvent(event, _eventConfig);

		const objectsIntersectedOnPointerdown = this._objectsIntersectedOnPointerdown;
		for (const object of objectsIntersectedOnPointerdown) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnPointerup = this._intersectedStateOnPointerupByObject.get(object);
				if (isIntersectingOnPointerup == true) {
					for (const properties of propertiesList) {
						if (
							movedCursorDistance < properties.click.maxCursorMoveDistance &&
							propertyMatchesEventConfig(properties.config, _eventConfig)
						) {
							properties.click.callback();
						}
					}
				}
			}
		}
	}
}
