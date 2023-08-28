import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';
import {Camera} from 'three';
import {CoreObject} from '../geometry/Object';
import {CameraAttribute} from './CoreCamera';
import {CameraFPSSopOperation} from '../../engine/operations/sop/CameraFPS';
const DEFAULT = CameraFPSSopOperation.DEFAULT_PARAMS;

export function CoreCameraFPSParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param expected FPS */
		maxFPS = ParamConfig.INTEGER(DEFAULT.maxFPS, {
			range: [0, 120],
			rangeLocked: [true, false],
		});
		/** @param allow dynamic change. If this is true, the viewer will check the attribute on the camera at every frame, before adapting the FPS. This allows to change the FPS at a later stage */
		allowDynamicChange = ParamConfig.BOOLEAN(DEFAULT.allowDynamicChange);
	};
}

interface CreateViewerFPSOptions {
	camera: Camera;
}
export interface ViewerFPSConfig {
	minDelta: () => number;
}
const _getMinDelta = (fps: number) => {
	return 1 / fps;
};
const SAFETY_THRESHOLD = 0.1;
export function isDeltaValid(accumulatedDelta: number, condig: ViewerFPSConfig): boolean {
	const minDelta = condig.minDelta();
	// if we have waited long enough to render this frame, we render it
	if (accumulatedDelta > minDelta) {
		return true;
	}
	// if the accumulated delta is less than the minDelta, we don't render,
	// except if the difference between the 2 is below a threshold
	const deltaDeltas = minDelta - accumulatedDelta;
	if (deltaDeltas > 0 && deltaDeltas / minDelta > SAFETY_THRESHOLD) {
		return false;
	}
	return true;
}

export class CoreCameraViewerFPSController {
	static viewerFPSConfig(options: CreateViewerFPSOptions): ViewerFPSConfig | undefined {
		const {camera} = options;

		const _getMaxFPSIfPreset = () => {
			return CoreObject.attribValue(camera, CameraAttribute.MAX_FPS) as number | null;
		};

		const maxFPS = _getMaxFPSIfPreset();
		if (maxFPS == null) {
			return;
		}

		const _minDelta = _getMinDelta(maxFPS);
		const allowDynamicChange =
			(CoreObject.attribValue(camera, CameraAttribute.MAX_FPS_DYNAMIC_CHANGE) as boolean | null) || false;

		if (allowDynamicChange) {
			const defaultMinDelta = _getMinDelta(60);
			const config: ViewerFPSConfig = {
				minDelta: () => {
					const maxFPS = _getMaxFPSIfPreset();
					if (maxFPS == null) {
						return defaultMinDelta;
					}
					return _getMinDelta(maxFPS);
				},
			};
			return config;
		} else {
			const config: ViewerFPSConfig = {
				minDelta: () => _minDelta,
			};
			return config;
		}
	}
}
