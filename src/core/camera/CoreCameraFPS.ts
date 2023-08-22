import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';
import {Camera} from 'three';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';

export function CoreCameraFPSParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param expected FPS */
		maxFPS = ParamConfig.INTEGER(60, {
			range: [0, 120],
			rangeLocked: [true, false],
		});
	};
}

interface CreateViewerFPSOptions {
	camera: Camera;
}
export interface ViewerFPSConfig {
	minDelta: number;
}

export class CoreCameraViewerFPSController {
	static viewerFPSConfig(options: CreateViewerFPSOptions): ViewerFPSConfig | undefined {
		const {camera} = options;

		const maxFPS = CoreObject.attribValue(camera, CameraAttribute.MAX_FPS) as number | null;
		if (maxFPS != null) {
			const config: ViewerFPSConfig = {
				minDelta: 1000 / maxFPS,
			};
			return config;
		}
	}
}
