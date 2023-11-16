import {Object3D} from 'three';
import {Constructor, ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {
	ObjectOptions,
	GPUOptions,
	CPUOptions,
	PriorityOptions,
	ButtonsAndModifierOptions,
	// ButtonAndModifierIndexOptions,
	ButtonsAndModifierOptionsAsString,
	filterObjectsWithMatchButtonsConfig,
	propertyMatchesButtonsConfig,
	ButtonsConfig,
	buttonsConfigFromEvent,
	// modifierIndexToModifierOptions,
} from './Common';
import {ParamConfig} from '../../../../nodes/utils/params/ParamsConfig';
import {MouseButtons} from '../../../../../core/MouseButton';
import {CursorMoveMonitor} from '../../../../../core/CursorMoveMonitor';

interface ClickOptions {
	maxCursorMoveDistance: number;
	maxDuration: number;
	callback: () => void;
}

export interface ObjectToMouseClickOptions extends ObjectOptions {
	click: ClickOptions;
	config: ButtonsAndModifierOptions;
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
	config: ButtonsAndModifierOptionsAsString;
}
const _buttonsConfig: ButtonsConfig = {buttons: MouseButtons.LEFT, ctrl: false, shift: false, alt: false};

function hasPropertiesWithCursorMoveLessThan(options: ObjectToMouseClickOptions[], distance: number) {
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
		/** @param max duration */
		maxDuration = ParamConfig.INTEGER(200, {
			range: [0, 1000],
			rangeLocked: [true, false],
		});
	};
}

export class RayObjectIntersectionsMouseClickController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToMouseClickOptions[]> = new Map();
	protected _intersectedStateOnMousedownByObject: Map<Object3D, boolean> = new Map();
	protected _intersectedStateOnMouseupByObject: Map<Object3D, boolean> = new Map();
	private _objectsMatchingEventConfig: Object3D[] = [];
	private _objectsIntersectedOnMousedown: Object3D[] = [];
	private _cursorMoveMonitor = new CursorMoveMonitor();
	private _mousedownEvent: Readonly<PointerEvent | MouseEvent | TouchEvent> | undefined;
	private _mousedownReceivedAt: number = 0;

	private _bound = {
		mouseup: this._onMouseup.bind(this),
	};
	onMousedown(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		this._mousedownEvent = event;
		this._mousedownReceivedAt = performance.now();
		if (this._objects.length == 0) {
			return;
		}
		filterObjectsWithMatchButtonsConfig(
			event,
			this._objects,
			this._propertiesListByObject,
			this._objectsMatchingEventConfig
		);
		if (this._objectsMatchingEventConfig.length == 0) {
			return;
		}
		document.addEventListener('mouseup', this._bound.mouseup);
		// we also need touchend, as pointerup appears to not be triggered if the cursor has moved a little bit
		document.addEventListener('touchend', this._bound.mouseup);
		this._cursorMoveMonitor.addPointermoveEventListener(
			this._scene.eventsDispatcher.pointerEventsController.cursor()
		);
		this._setIntersectedState(this._objectsMatchingEventConfig, this._intersectedStateOnMousedownByObject);
	}

	private _onMouseup() {
		document.removeEventListener('mouseup', this._bound.mouseup);
		document.removeEventListener('touchend', this._bound.mouseup);
		this._cursorMoveMonitor.removeEventListener();
		const event = this._mousedownEvent;
		if (!event) {
			return;
		}
		this._mousedownEvent = undefined;
		const duration = performance.now() - this._mousedownReceivedAt;

		const movedCursorDistance = this._cursorMoveMonitor.movedCursorDistance();

		const objects = this._objectsMatchingEventConfig;
		this._objectsIntersectedOnMousedown.length = 0;
		for (const object of objects) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList && hasPropertiesWithCursorMoveLessThan(propertiesList, movedCursorDistance)) {
				const isIntersectingOnMousedown = this._intersectedStateOnMousedownByObject.get(object);
				if (isIntersectingOnMousedown) {
					this._objectsIntersectedOnMousedown.push(object);
				}
			}
		}

		// I've considered using only the objects intersected in pointerdown for the pointerup detection,
		// but that prevents missed objects from occluding others if they are in front.
		// We therefore need to run the detection on all objects
		// instead, we can still optimise by not detecting anything if that list is empty
		if (this._objectsIntersectedOnMousedown.length == 0) {
			return;
		}
		this._setIntersectedState(objects, this._intersectedStateOnMouseupByObject);
		buttonsConfigFromEvent(event, _buttonsConfig);

		const objectsIntersectedOnMousedown = this._objectsIntersectedOnMousedown;
		for (const object of objectsIntersectedOnMousedown) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnMouseup = this._intersectedStateOnMouseupByObject.get(object);
				if (isIntersectingOnMouseup == true) {
					for (const properties of propertiesList) {
						if (
							movedCursorDistance < properties.click.maxCursorMoveDistance &&
							duration < properties.click.maxDuration &&
							propertyMatchesButtonsConfig(properties.config, _buttonsConfig)
						) {
							properties.click.callback();
						}
					}
				}
			}
		}
	}
}
