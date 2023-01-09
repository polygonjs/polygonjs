import {Camera, Scene} from 'three';
import {TypeAssert} from '../../../engine/poly/Assert';

export type ARjsControllerRenderFunction = () => void;
export type ARjsControllerMountFunction = () => void;
export type ARjsControllerUnmountFunction = () => void;
// export type ARjsControllerResizeFunction = () => void;

export interface CoreCameraARjsControllerConfig {
	renderFunction: ARjsControllerRenderFunction;
	mountFunction: ARjsControllerMountFunction;
	unmountFunction: ARjsControllerUnmountFunction;
	// resizeFunction: ARjsControllerResizeFunction;
}

export type ArChangeMatrixMode = 'cameraTransformMatrix' | 'modelViewMatrix';
export enum ArjsTransformMode {
	CAMERA = 'camera',
	MARKER = 'marker',
}
export const ARJS_TRANSFORM_MODES: ArjsTransformMode[] = [ArjsTransformMode.CAMERA, ArjsTransformMode.MARKER];
export function changeMatrixModeFromTransformMode(transformMode: ArjsTransformMode): ArChangeMatrixMode {
	switch (transformMode) {
		case ArjsTransformMode.CAMERA: {
			return 'cameraTransformMatrix';
		}
		case ArjsTransformMode.MARKER: {
			return 'modelViewMatrix';
		}
	}
	TypeAssert.unreachable(transformMode);
}

export interface CoreARjsControllerOptions {
	canvas: HTMLCanvasElement;
	camera: Camera;
	scene: Scene;
	barCode: {
		type: ARjsBarCodeType;
		value: number;
	};
	transformMode: ArjsTransformMode;
	// onResize: () => void;
}

export enum ARjsBarCodeType {
	_3x3 = '3x3',
	_3x3_HAMMING63 = '3x3_HAMMING63',
	_3x3_PARITY65 = '3x3_PARITY65',
	// _4x4='4x4',
	_4x4_BCH_13_9_3 = '4x4_BCH_13_9_3',
	_4x4_BCH_13_5_5 = '4x4_BCH_13_5_5',
}
export const ARJS_BAR_CODE_TYPES: ARjsBarCodeType[] = [
	ARjsBarCodeType._3x3,
	ARjsBarCodeType._3x3_HAMMING63,
	ARjsBarCodeType._3x3_PARITY65,
	ARjsBarCodeType._4x4_BCH_13_5_5,
	ARjsBarCodeType._4x4_BCH_13_9_3,
];
export type BarCodesCountByType = Record<ARjsBarCodeType, number>;
export const BAR_CODES_COUNT_BY_TYPE: BarCodesCountByType = {
	[ARjsBarCodeType._3x3]: 64,
	[ARjsBarCodeType._3x3_HAMMING63]: 8,
	[ARjsBarCodeType._3x3_PARITY65]: 32,
	[ARjsBarCodeType._4x4_BCH_13_5_5]: 32,
	[ARjsBarCodeType._4x4_BCH_13_9_3]: 512,
};
export type BarCodeFolderByType = Record<ARjsBarCodeType, string>;
export const BAR_CODE_FOLDER_BY_TYPE: BarCodeFolderByType = {
	[ARjsBarCodeType._3x3]: '3x3',
	[ARjsBarCodeType._3x3_HAMMING63]: '3x3_hamming_6_3',
	[ARjsBarCodeType._3x3_PARITY65]: '3x3_parity_6_5',
	[ARjsBarCodeType._4x4_BCH_13_5_5]: '4x4_bch_13_5_5',
	[ARjsBarCodeType._4x4_BCH_13_9_3]: '4x4_bch_13_9_3',
};

const BAR_CODE_ROOT = 'https://raw.githubusercontent.com/polygonjs/artoolkit-barcode-markers-collection/master';
export function arjsbarCodeUrl(type: ARjsBarCodeType, value: number) {
	const folder = BAR_CODE_FOLDER_BY_TYPE[type];
	return `${BAR_CODE_ROOT}/${folder}/${value}.png`;
}
