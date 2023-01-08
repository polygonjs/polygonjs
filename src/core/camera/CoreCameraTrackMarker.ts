import {Constructor} from '../../types/GlobalTypes';
import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {CoreCameraARjsControllerConfig, CoreARjsControllerOptions} from '../webXR/arjs/Common';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {PolyScene} from '../../engine/scene/PolyScene';

export function CoreCameraTrackMarkerParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param marker */
		marker = ParamConfig.STRING('', {
			fileBrowse: {extensions: ['patt']},
		});
	};
}

interface ARjsControllerOptions extends CoreARjsControllerOptions {
	// camera: Camera;
	polyScene: PolyScene;
	// renderer: WebGLRenderer;
	// canvas: HTMLCanvasElement;
}

export class CoreCameraTrackMarkerController {
	static process(options: ARjsControllerOptions): CoreCameraARjsControllerConfig | undefined {
		const {polyScene, camera, scene} = options;

		const isARjsTrackMarker = CoreObject.attribValue(camera, CameraAttribute.ARJS_TRACK_MARKER) as boolean | null;
		if (!isARjsTrackMarker) {
			return;
		}
		const createFunction = polyScene.arjs.controllerCreateFunction();
		if (!createFunction) {
			console.warn('no ARjs controller create function');
			return;
		}
		const controller = createFunction({
			camera,
			scene,
		});

		return controller.config();
	}
}
