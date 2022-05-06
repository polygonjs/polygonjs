// import type {BaseThreejsCameraObjNodeType} from '../../_BaseCamera';
import {BaseNodeType} from '../../../_Base';
import {Constructor} from '../../../../../types/GlobalTypes';
import {NetworkNodeType} from '../../../../poly/NodeContext';
// interface DisposablePass extends Pass {
// 	dispose: () => void;
// }
const POST_PROCESS_PARAM_OPTIONS = {
	callback: (node: BaseNodeType) => {
		// PARAM_CALLBACK_reset_effects_composer(node as BaseThreejsCameraObjNodeType);
	},
};

import {ParamConfig} from '../../../utils/params/ParamsConfig';
// import {PARAM_CALLBACK_reset_effects_composer} from './postProcessParamCallback';
export function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		doPostProcess = ParamConfig.BOOLEAN(0);
		postProcessNode = ParamConfig.NODE_PATH('', {
			visibleIf: {
				doPostProcess: 1,
			},
			nodeSelection: {
				types: [NetworkNodeType.POST],
			},
			// cook: false,
			...POST_PROCESS_PARAM_OPTIONS,
		});
		// prepend_render_pass = ParamConfig.BOOLEAN(1, {
		// 	visibleIf: {
		// 		doPostProcess: 1,
		// 	},
		// });
		// use_render_target = ParamConfig.BOOLEAN(0, {
		// 	visibleIf: {
		// 		doPostProcess: 1,
		// 	},
		// 	...POST_PROCESS_PARAM_OPTIONS,
		// });
	};
}
