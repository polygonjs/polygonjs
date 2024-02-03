import {Object3D} from 'three';
import {Constructor, ConvertToStrings} from '../../../../../types/GlobalTypes';
import {BaseRayObjectIntersectionsController} from './_BaseRayObjectIntersectionsController';
import {
	ObjectOptions,
	GPUOptions,
	CPUOptions,
	PriorityOptions,
	ButtonConfig,
	buttonConfigFromEvent,
	ModifierOptionsAsString,
	filterObjectsWithMatchModifiersConfig,
	OnlyModifierOptions,
	propertyMatchesModifiersConfig,
} from './Common';
import {MouseButton} from '../../../../../core/MouseButton';

interface DoubleClickOptions {
	callback: () => void;
}

export interface ObjectToClickOptions extends ObjectOptions {
	doubleClick: DoubleClickOptions;
	config: OnlyModifierOptions;
}

export interface ObjectToDoubleClickOptionsAsString {
	priority: ConvertToStrings<PriorityOptions>;
	cpu?: ConvertToStrings<CPUOptions>;
	gpu?: ConvertToStrings<GPUOptions>;
	doubleClick: ConvertToStrings<DoubleClickOptions>;
	config: ModifierOptionsAsString;
}
const _buttonConfig: ButtonConfig = {button: MouseButton.LEFT, ctrl: false, shift: false, alt: false};

export function DoubleClickParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {};
}

export class RayObjectIntersectionsDoubleClickController extends BaseRayObjectIntersectionsController {
	protected override _propertiesListByObject: Map<Object3D, ObjectToClickOptions[]> = new Map();
	protected _intersectedStateOnDoubleClickByObject: Map<Object3D, boolean> = new Map();
	private _objectsMatchingEventConfig: Object3D[] = [];

	onDoubleClick(event: Readonly<PointerEvent | MouseEvent | TouchEvent>) {
		if (this._objects.length == 0) {
			return;
		}
		filterObjectsWithMatchModifiersConfig(
			event,
			this._objects,
			this._propertiesListByObject,
			this._objectsMatchingEventConfig
		);
		if (this._objectsMatchingEventConfig.length == 0) {
			return;
		}

		this._setIntersectedState(this._objectsMatchingEventConfig, this._intersectedStateOnDoubleClickByObject);

		buttonConfigFromEvent(event, _buttonConfig);

		for (const object of this._objectsMatchingEventConfig) {
			const propertiesList = this._propertiesListByObject.get(object);
			if (propertiesList) {
				const isIntersectingOnDoubleClick = this._intersectedStateOnDoubleClickByObject.get(object);
				if (isIntersectingOnDoubleClick == true) {
					for (const properties of propertiesList) {
						if (propertyMatchesModifiersConfig(properties.config, _buttonConfig)) {
							properties.doubleClick.callback();
						}
					}
				}
			}
		}
	}
}
