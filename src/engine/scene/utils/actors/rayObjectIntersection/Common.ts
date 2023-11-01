import type {Ref} from '@vue/reactivity';
import {Intersection, Material, Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {MouseButton} from '../../../../../core/MouseButton';
import {TypeAssert} from '../../../../poly/Assert';

export interface PriorityOptions {
	blockObjectsBehind: boolean;
	skipIfObjectsInFront: boolean;
}
export interface CPUOptions {
	traverseChildren: boolean;
	pointsThreshold: number;
	lineThreshold: number;
	intersectionRef: Ref<Intersection | null>;
}
export interface GPUOptions {
	// if a worldPosMaterial is given, we use it and only need a single render call.
	// if not, we render need 2 renders, 1 to write to the depth buffer and another to read it (in addition to readRenderTargetPixels)
	worldPosMaterial: Material | null;
	distanceRef: Ref<number>;
}
export interface ObjectOptions {
	priority: PriorityOptions;
	cpu?: CPUOptions;
	gpu?: GPUOptions;
}

export function hasCPUOptions(optionsList: ObjectOptions[]): boolean {
	for (const options of optionsList) {
		if (options.cpu != null) {
			return true;
		}
	}
	return false;
}
export function hasGPUOptions(optionsList: ObjectOptions[]): boolean {
	for (const options of optionsList) {
		if (options.gpu != null) {
			return true;
		}
	}
	return false;
}
export function GPUOptionsDepthBufferRequired(optionsList: ObjectOptions[]): boolean {
	for (const options of optionsList) {
		if (options.gpu != null && options.gpu.worldPosMaterial == null) {
			return true;
		}
	}
	return false;
}
function _cpuOptionsEqual(options1: CPUOptions, options2: CPUOptions): boolean {
	return (
		options1.traverseChildren == options2.traverseChildren &&
		options1.pointsThreshold == options2.pointsThreshold &&
		options1.lineThreshold == options2.lineThreshold
	);
}

export function CPUOptionsEqual(optionsList: ObjectOptions[]): boolean {
	let firstCPUOptions: CPUOptions | undefined;
	for (const options of optionsList) {
		if (options.cpu != null) {
			if (firstCPUOptions == null) {
				firstCPUOptions = options.cpu;
			} else {
				if (!_cpuOptionsEqual(firstCPUOptions, options.cpu)) {
					return false;
				}
			}
		}
	}
	return true;
}

export function CPUOptionsMax(optionsList: ObjectOptions[], target: CPUOptions): CPUOptions {
	target.traverseChildren = false;
	target.pointsThreshold = -1;
	target.lineThreshold = -1;
	for (const options of optionsList) {
		if (options.cpu != null) {
			if (target.traverseChildren == false && options.cpu.traverseChildren == true) {
				target.traverseChildren = options.cpu.traverseChildren;
			}
			if (target.pointsThreshold < options.cpu.pointsThreshold) {
				target.pointsThreshold = options.cpu.pointsThreshold;
			}
			if (target.lineThreshold < options.cpu.lineThreshold) {
				target.lineThreshold = options.cpu.lineThreshold;
			}
		}
	}
	return target;
}

export enum PointerEventModifierOption {
	REQUIRED = 0, //'required',
	OPTIONAL = 1, //'optional',
	FORBIDDEN = 2, //'forbidden',
}
export const POINTER_EVENT_MODIFIER_OPTIONS: PointerEventModifierOption[] = [
	PointerEventModifierOption.REQUIRED,
	PointerEventModifierOption.OPTIONAL,
	PointerEventModifierOption.FORBIDDEN,
];
export const POINTER_EVENT_MODIFIER_OPTION_LABEL: string[] = ['required', 'optional', 'forbidden'];
export const DEFAULT_MODIFIER_OPTION = POINTER_EVENT_MODIFIER_OPTIONS.indexOf(PointerEventModifierOption.OPTIONAL);
export const POINTER_EVENT_MODIFIER_MENU_OPTIONS = {
	menu: {
		entries: POINTER_EVENT_MODIFIER_OPTIONS.map((value) => ({
			value,
			name: POINTER_EVENT_MODIFIER_OPTION_LABEL[value],
		})),
	},
};
export interface ButtonOptions {
	left: boolean;
	middle: boolean;
	right: boolean;
}
export interface ModifierOptions {
	ctrl: PointerEventModifierOption;
	shift: PointerEventModifierOption;
	alt: PointerEventModifierOption;
}
// export interface ModifierIndexOptions {
// 	ctrl: number;
// 	shift: number;
// 	alt: number;
// }
// export function modifierIndexToModifierOptions(options: ModifierIndexOptions): ModifierOptions {
// 	return {
// 		ctrl: POINTER_EVENT_MODIFIER_OPTIONS[options.ctrl],
// 		shift: POINTER_EVENT_MODIFIER_OPTIONS[options.shift],
// 		alt: POINTER_EVENT_MODIFIER_OPTIONS[options.alt],
// 	};
// }
export interface ButtonAndModifierOptions {
	button: ButtonOptions;
	modifier: ModifierOptions;
}
// export interface ButtonAndModifierIndexOptions {
// 	button: ButtonOptions;
// 	modifier: ModifierIndexOptions;
// }
export interface ButtonAndModifierOptionsAsString {
	button: ConvertToStrings<ButtonOptions>;
	modifier: ConvertToStrings<ModifierOptions>;
}

interface PropertyWithConfig {
	config: ButtonAndModifierOptions;
}
export interface EventConfig {
	button: MouseButton;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
}
function modifierMatch(modifierProperty: PointerEventModifierOption, eventModifier: boolean): boolean {
	switch (modifierProperty) {
		case PointerEventModifierOption.REQUIRED: {
			return eventModifier == true;
		}
		case PointerEventModifierOption.OPTIONAL: {
			return true;
		}
		case PointerEventModifierOption.FORBIDDEN: {
			return eventModifier == false;
		}
	}
	TypeAssert.unreachable(modifierProperty);
}
export function propertyMatchesEventConfig(propertyConfig: ButtonAndModifierOptions, eventConfig: EventConfig) {
	switch (eventConfig.button) {
		case MouseButton.LEFT: {
			if (propertyConfig.button.left == false) {
				return false;
			}
			break;
		}
		case MouseButton.MIDDLE: {
			if (propertyConfig.button.middle == false) {
				return false;
			}
			break;
		}
		case MouseButton.RIGHT: {
			if (propertyConfig.button.right == false) {
				return false;
			}
			break;
		}
	}
	return (
		modifierMatch(propertyConfig.modifier.ctrl, eventConfig.ctrl) &&
		modifierMatch(propertyConfig.modifier.shift, eventConfig.shift) &&
		modifierMatch(propertyConfig.modifier.alt, eventConfig.alt)
	);
}
function propertiesMatchesEventConfig(propertiesList: PropertyWithConfig[], eventConfig: EventConfig): boolean {
	for (const properties of propertiesList) {
		if (propertyMatchesEventConfig(properties.config, eventConfig)) {
			return true;
		}
	}
	return false;
}

export function eventConfigFromEvent(event: Readonly<PointerEvent | MouseEvent | TouchEvent>, target: EventConfig) {
	target.button = (event as PointerEvent).button || MouseButton.LEFT;
	target.ctrl = event.ctrlKey;
	target.shift = event.shiftKey;
	target.alt = event.altKey;
}
const _eventConfig: EventConfig = {button: MouseButton.LEFT, ctrl: false, shift: false, alt: false};
export function filterObjectsWithMatchEventConfig(
	event: Readonly<PointerEvent | MouseEvent | TouchEvent>,
	objects: Object3D[],
	propertiesListByObject: Map<Object3D, PropertyWithConfig[]>,
	target: Object3D[]
) {
	target.length = 0;
	eventConfigFromEvent(event, _eventConfig);
	for (const object of objects) {
		const propertiesList = propertiesListByObject.get(object);
		if (propertiesList) {
			if (propertiesMatchesEventConfig(propertiesList, _eventConfig)) {
				target.push(object);
			}
		}
	}
}
