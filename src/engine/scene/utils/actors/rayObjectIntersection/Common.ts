import type {Ref} from '@vue/reactivity';
import {Intersection, Material, Object3D} from 'three';
import {ConvertToStrings} from '../../../../../types/GlobalTypes';
import {MouseButton, MouseButtons} from '../../../../../core/MouseButton';
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
export interface EmptyOptions {}

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

export enum Status {
	REQUIRED = 0, //'required',
	OPTIONAL = 1, //'optional',
	FORBIDDEN = 2, //'forbidden',
}
export const STATUS_OPTIONS: Status[] = [Status.REQUIRED, Status.OPTIONAL, Status.FORBIDDEN];
export const STATUS_OPTION_LABEL: string[] = ['required', 'optional', 'forbidden'];
export const DEFAULT_STATUS_OPTION = STATUS_OPTIONS.indexOf(Status.OPTIONAL);
export const STATUS_MENU_OPTIONS = {
	menu: {
		entries: STATUS_OPTIONS.map((value) => ({
			value,
			name: STATUS_OPTION_LABEL[value],
		})),
	},
};
export interface ButtonOptions {
	left: boolean;
	middle: boolean;
	right: boolean;
}
export interface ButtonsOptions {
	left: Status;
	middle: Status;
	right: Status;
}
export interface ModifierOptions {
	ctrl: Status;
	shift: Status;
	alt: Status;
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
export interface ButtonsAndModifierOptions {
	button: ButtonsOptions;
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
export interface ButtonsAndModifierOptionsAsString {
	button: ConvertToStrings<ButtonsOptions>;
	modifier: ConvertToStrings<ModifierOptions>;
}

interface PropertyWithButtonConfig {
	config: ButtonAndModifierOptions;
}
interface PropertyWithButtonsConfig {
	config: ButtonsAndModifierOptions;
}
export interface ButtonConfig {
	button: MouseButton;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
}
export interface ButtonsConfig {
	buttons: MouseButtons;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
}
function statusMatch(modifierProperty: Status, value: boolean): boolean {
	switch (modifierProperty) {
		case Status.REQUIRED: {
			return value == true;
		}
		case Status.OPTIONAL: {
			return true;
		}
		case Status.FORBIDDEN: {
			return value == false;
		}
	}
	TypeAssert.unreachable(modifierProperty);
}
export function propertyMatchesButtonConfig(propertyConfig: ButtonAndModifierOptions, buttonConfig: ButtonConfig) {
	switch (buttonConfig.button) {
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
		statusMatch(propertyConfig.modifier.ctrl, buttonConfig.ctrl) &&
		statusMatch(propertyConfig.modifier.shift, buttonConfig.shift) &&
		statusMatch(propertyConfig.modifier.alt, buttonConfig.alt)
	);
}
export function propertyMatchesButtonsConfig(propertyConfig: ButtonsAndModifierOptions, buttonsConfig: ButtonsConfig) {
	switch (buttonsConfig.buttons) {
		case MouseButtons.LEFT: {
			if (
				propertyConfig.button.left == Status.FORBIDDEN ||
				propertyConfig.button.middle == Status.REQUIRED ||
				propertyConfig.button.right == Status.REQUIRED
			) {
				return false;
			}
			break;
		}
		case MouseButtons.MIDDLE: {
			if (
				propertyConfig.button.left == Status.REQUIRED ||
				propertyConfig.button.middle == Status.FORBIDDEN ||
				propertyConfig.button.right == Status.REQUIRED
			) {
				return false;
			}
			break;
		}
		case MouseButtons.RIGHT: {
			if (
				propertyConfig.button.left == Status.REQUIRED ||
				propertyConfig.button.middle == Status.REQUIRED ||
				propertyConfig.button.right == Status.FORBIDDEN
			) {
				return false;
			}
			break;
		}
		case MouseButtons.LEFT_RIGHT: {
			if (
				propertyConfig.button.left == Status.FORBIDDEN ||
				propertyConfig.button.middle == Status.REQUIRED ||
				propertyConfig.button.right == Status.FORBIDDEN
			) {
				return false;
			}
			break;
		}
		case MouseButtons.LEFT_MIDDLE: {
			if (
				propertyConfig.button.left == Status.FORBIDDEN ||
				propertyConfig.button.middle == Status.FORBIDDEN ||
				propertyConfig.button.right == Status.REQUIRED
			) {
				return false;
			}
			break;
		}
		case MouseButtons.MIDDLE_RIGHT: {
			if (
				propertyConfig.button.left == Status.REQUIRED ||
				propertyConfig.button.middle == Status.FORBIDDEN ||
				propertyConfig.button.right == Status.FORBIDDEN
			) {
				return false;
			}
			break;
		}
		case MouseButtons.LEFT_MIDDLE_RIGHT: {
			if (
				propertyConfig.button.left == Status.FORBIDDEN ||
				propertyConfig.button.middle == Status.FORBIDDEN ||
				propertyConfig.button.right == Status.FORBIDDEN
			) {
				return false;
			}
			break;
		}
	}
	return (
		statusMatch(propertyConfig.modifier.ctrl, buttonsConfig.ctrl) &&
		statusMatch(propertyConfig.modifier.shift, buttonsConfig.shift) &&
		statusMatch(propertyConfig.modifier.alt, buttonsConfig.alt)
	);
}
function propertiesMatchesButtonConfig(
	propertiesList: PropertyWithButtonConfig[],
	buttonConfig: ButtonConfig
): boolean {
	for (const properties of propertiesList) {
		if (propertyMatchesButtonConfig(properties.config, buttonConfig)) {
			return true;
		}
	}
	return false;
}
function propertiesMatchesButtonsConfig(
	propertiesList: PropertyWithButtonsConfig[],
	buttonConfig: ButtonsConfig
): boolean {
	for (const properties of propertiesList) {
		if (propertyMatchesButtonsConfig(properties.config, buttonConfig)) {
			return true;
		}
	}
	return false;
}

export function buttonConfigFromEvent(event: Readonly<PointerEvent | MouseEvent | TouchEvent>, target: ButtonConfig) {
	target.button = (event as PointerEvent).button || MouseButton.LEFT;
	target.ctrl = event.ctrlKey;
	target.shift = event.shiftKey;
	target.alt = event.altKey;
}
export function buttonsConfigFromEvent(event: Readonly<PointerEvent | MouseEvent | TouchEvent>, target: ButtonsConfig) {
	target.buttons = (event as MouseEvent).buttons || MouseButtons.LEFT;
	target.ctrl = event.ctrlKey;
	target.shift = event.shiftKey;
	target.alt = event.altKey;
}
const _buttonConfig: ButtonConfig = {button: MouseButton.LEFT, ctrl: false, shift: false, alt: false};
const _buttonsConfig: ButtonsConfig = {buttons: MouseButtons.LEFT, ctrl: false, shift: false, alt: false};
export function filterObjectsWithMatchButtonConfig(
	event: Readonly<PointerEvent | MouseEvent | TouchEvent>,
	objects: Object3D[],
	propertiesListByObject: Map<Object3D, PropertyWithButtonConfig[]>,
	target: Object3D[]
) {
	target.length = 0;
	buttonConfigFromEvent(event, _buttonConfig);
	for (const object of objects) {
		const propertiesList = propertiesListByObject.get(object);
		if (propertiesList) {
			if (propertiesMatchesButtonConfig(propertiesList, _buttonConfig)) {
				target.push(object);
			}
		}
	}
}
export function filterObjectsWithMatchButtonsConfig(
	event: Readonly<PointerEvent | MouseEvent | TouchEvent>,
	objects: Object3D[],
	propertiesListByObject: Map<Object3D, PropertyWithButtonsConfig[]>,
	target: Object3D[]
) {
	target.length = 0;
	buttonsConfigFromEvent(event, _buttonsConfig);
	for (const object of objects) {
		const propertiesList = propertiesListByObject.get(object);
		if (propertiesList) {
			if (propertiesMatchesButtonsConfig(propertiesList, _buttonsConfig)) {
				target.push(object);
			}
		}
	}
}
