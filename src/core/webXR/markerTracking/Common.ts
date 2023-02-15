import {Camera, Scene} from 'three';

export type MarkerTrackingControllerRenderFunction = () => void;
export type MarkerTrackingControllerMountFunction = () => void;
export type MarkerTrackingControllerUnmountFunction = () => void;

export interface MarkerTrackingControllerConfig {
	renderFunction: MarkerTrackingControllerRenderFunction;
	mountFunction: MarkerTrackingControllerMountFunction;
	unmountFunction: MarkerTrackingControllerUnmountFunction;
}

export enum MarkerTrackingSourceMode {
	WEBCAM = 'webcam',
	IMAGE = 'image',
	VIDEO = 'video',
}
export const MARKER_TRACKING_SOURCE_MODES: MarkerTrackingSourceMode[] = [
	MarkerTrackingSourceMode.WEBCAM,
	MarkerTrackingSourceMode.IMAGE,
	MarkerTrackingSourceMode.VIDEO,
];

export enum MarkerTrackingTransformMode {
	CAMERA = 'camera',
	MARKER = 'marker',
}
export const MARKER_TRACKING_TRANSFORM_MODES: MarkerTrackingTransformMode[] = [
	MarkerTrackingTransformMode.CAMERA,
	MarkerTrackingTransformMode.MARKER,
];

export interface CoreMarkerTrackingControllerOptions {
	sourceMode: MarkerTrackingSourceMode;
	sourceUrl?: string;
	canvas: HTMLCanvasElement;
	camera: Camera;
	scene: Scene;
	barCode: {
		type: string;
		value: number;
	};
	transformMode: MarkerTrackingTransformMode;
	smooth: {
		active: boolean;
		count: number;
	};
}
