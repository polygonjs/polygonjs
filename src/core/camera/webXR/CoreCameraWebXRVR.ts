import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {CameraWebXRVRSopOperation} from '../../../engine/operations/sop/CameraWebXRVR';
import {Constructor} from '../../../types/GlobalTypes';
import {
	DEFAULT_WEBXR_REFERENCE_SPACE_TYPE,
	WEBXR_FEATURE_PARAM_OPTIONS,
	WEBXR_REFERENCE_SPACE_TYPES,
} from '../../webXR/Common';

const DEFAULT = CameraWebXRVRSopOperation.DEFAULT_PARAMS;
export function CoreCameraWebXRVRParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param loads AR session with 'local-floor' feature */
		localFloor = ParamConfig.INTEGER(DEFAULT.localFloor, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param loads AR session with 'bounded-floor' feature */
		boundedFloor = ParamConfig.INTEGER(DEFAULT.boundedFloor, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param loads AR session with 'hand-tracking' feature */
		handTracking = ParamConfig.INTEGER(DEFAULT.handTracking, WEBXR_FEATURE_PARAM_OPTIONS);
		/** @param loads AR session with 'layers' feature */
		layers = ParamConfig.INTEGER(DEFAULT.layers, WEBXR_FEATURE_PARAM_OPTIONS);
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
