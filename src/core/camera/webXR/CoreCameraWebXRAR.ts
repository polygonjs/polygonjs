import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {CameraWebXRARSopOperation} from '../../../engine/operations/sop/CameraWebXRAR';
import {Constructor} from '../../../types/GlobalTypes';
import {WEBXR_FEATURE_PARAM_OPTIONS} from '../../webXR/Common';

const DEFAULT = CameraWebXRARSopOperation.DEFAULT_PARAMS;
export function CoreCameraWebXRARParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param loads AR session with 'hit-test' feature */
		hitTest = ParamConfig.INTEGER(DEFAULT.hitTest, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param loads AR session with 'light-estimation' feature */
		lightEstimation = ParamConfig.INTEGER(DEFAULT.lightEstimation, WEBXR_FEATURE_PARAM_OPTIONS);
	};
}
