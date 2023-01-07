import {Constructor} from '../../../../../types/GlobalTypes';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
export function CameraWebXRParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param allows this camera to be used in AR (augmented reality) or VR (virtual reality) */
		useWebXR = ParamConfig.BOOLEAN(0);
		/** @param activates AR (augmented reality) */
		useAR = ParamConfig.BOOLEAN(1, {
			visibleIf: {useWebXR: 1},
		});
		/** @param activates VR (virtual reality) */
		useVR = ParamConfig.BOOLEAN(1, {
			visibleIf: {useWebXR: 1},
		});
	};
}
