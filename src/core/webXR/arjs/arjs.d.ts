import {Matrix4, Object3D} from 'three';
import {ArChangeMatrixMode, ARjsBarCodeType} from './Common';

// https://ar-js-org.github.io/AR.js-Docs/marker-based/
interface SourceParameters {
	// type of source - ['webcam', 'image', 'video']
	sourceType: 'webcam' | 'image' | 'video';
	// url of the source - valid if sourceType = image|video
	sourceUrl?: string;
	//
	sourceWidth: number;
	sourceHeight: number;
}

type LabelingMode = 'black_region' | 'white_region';
interface ContextParameters {
	detectionMode: 'color' | 'color_and_matrix' | 'mono' | 'mono_and_matrix';
	cameraParametersUrl: string;
	patternRatio: number;
	maxDetectionRate: number;
	labelingMode?: LabelingMode;
	matrixCodeType: ARjsBarCodeType;
}
type ArControllerOrientation = 'landscape' | 'portrait' | null;
interface ArController {
	canvas: HTMLCanvasElement;
	orientation: ArControllerOrientation;
	options: {
		orientation: ArControllerOrientation;
	};
}
type OnResizeCallback = () => void;
type OnContextCompletedCallback = () => void;

export class ArToolkitProfile {
	constructor();
	sourceWebcam: () => void;
	sourceImage(url: string): void;
	public sourceParameters: SourceParameters;
	public contextParameters: ContextParameters;
}
export class ArToolkitSource {
	public ready: boolean;
	public domElement: HTMLElement;
	constructor(sourceParameters: SourceParameters);
	init(resizeCallback: OnResizeCallback): void;
	onResizeElement(): void;
	copyElementSizeTo(element: HTMLElement): void;
}

export class ArToolkitContext {
	constructor(contextParameters: ContextParameters);
	init(onCompleted: OnContextCompletedCallback): void;
	arController: ArController | null;
	getProjectionMatrix: () => Matrix4;
	update: (element: HTMLElement) => void;
}

interface ArMarkerControlsOptions {
	type: 'barcode' | 'pattern';
	patternUrl?: string;
	changeMatrixMode?: ArChangeMatrixMode;
	barcodeValue?: number;
	smooth?: boolean;
	smoothCount?: number;
	smoothTolerance?: number;
	smoothThreshold?: number;
}
export class ArMarkerControls {
	constructor(context: ArToolkitContext, object: Object3D, options: ArMarkerControlsOptions);
}
export class ArSmoothedControls {
	constructor(object: Object3D);
	update: (object: Object3D) => void;
}
