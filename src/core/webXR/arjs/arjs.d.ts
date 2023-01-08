import {Group, Matrix4} from 'three';

interface SourceParameters {
	// type of source - ['webcam', 'image', 'video']
	sourceType: 'webcam' | 'image' | 'video';
	// url of the source - valid if sourceType = image|video
	sourceUrl: string;
}
interface ContextParameters {
	detectionMode: 'color' | 'color_and_matrix' | 'mono' | 'mono_and_matrix';
	cameraParametersUrl: string;
	patternRatio: number;
	maxDetectionRate: number;
}
interface ArController {
	canvas: HTMLCanvasElement;
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
	type: 'pattern';
	patternUrl: string;
}
export class ArMarkerControls {
	constructor(context: ArToolkitContext, group: Group, options: ArMarkerControlsOptions);
}
export class ArSmoothedControls {
	constructor(group: Group);
	update: (group: Group) => void;
}
