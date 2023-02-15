import {Matrix4} from 'three';
import {CoreMarkerTrackingControllerOptions, MarkerTrackingControllerConfig} from './Common';

export class CoreMarkerTrackingController {
	constructor(options: CoreMarkerTrackingControllerOptions) {}
	errorMessage(): string | void {}
	trackedMatrix(targetMatrix: Matrix4) {}
	config(): MarkerTrackingControllerConfig {
		return {
			renderFunction: function () {},
			mountFunction: function () {},
			unmountFunction: function () {},
		};
	}
}
