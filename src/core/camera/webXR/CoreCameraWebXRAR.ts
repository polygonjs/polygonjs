import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {CameraWebXRARSopOperation} from '../../../engine/operations/sop/CameraWebXRAR';
import {Constructor} from '../../../types/GlobalTypes';
import {
	DEFAULT_WEBXR_REFERENCE_SPACE_TYPE,
	WEBXR_FEATURE_PARAM_OPTIONS,
	WEBXR_REFERENCE_SPACE_TYPES,
} from '../../webXR/Common';

const DEFAULT = CameraWebXRARSopOperation.DEFAULT_PARAMS;
export function CoreCameraWebXRARParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param loads AR session with 'hit-test' feature */
		hitTest = ParamConfig.INTEGER(DEFAULT.hitTest, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param loads AR session with 'light-estimation' feature */
		lightEstimation = ParamConfig.INTEGER(DEFAULT.lightEstimation, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param loads AR session with 'camera-access' feature */
		cameraAccess = ParamConfig.INTEGER(DEFAULT.cameraAccess, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param overrides referenceSpaceType */
		overrideReferenceSpaceType = ParamConfig.BOOLEAN(0);
		/** @param set referenceSpaceType ( see doc: https://immersive-web.github.io/webxr/#xrreferencespace-interface ) */
		referenceSpaceType = ParamConfig.INTEGER(
			WEBXR_REFERENCE_SPACE_TYPES.indexOf(DEFAULT_WEBXR_REFERENCE_SPACE_TYPE),
			{
				menu: {
					entries: WEBXR_REFERENCE_SPACE_TYPES.map((name, value) => ({name, value})),
				},
				visibleIf: {
					overrideReferenceSpaceType: 1,
				},
			}
		);
	};
}
