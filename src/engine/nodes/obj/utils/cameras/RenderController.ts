import {Constructor} from '../../../../../types/GlobalTypes';
import {NodeContext} from '../../../../poly/NodeContext';
import {RopType} from '../../../../poly/registers/nodes/types/Rop';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {ObjType} from '../../../../poly/registers/nodes/types/Obj';

export function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		render = ParamConfig.FOLDER();

		/** @param toggle on to override rendered scene */
		setScene = ParamConfig.BOOLEAN(0);
		/** @param override rendered scene */
		scene = ParamConfig.NODE_PATH('', {
			visibleIf: {setScene: 1},
			nodeSelection: {
				context: NodeContext.OBJ,
				types: [ObjType.SCENE],
			},
		});

		/** @param toggle on to override the renderer */
		setRenderer = ParamConfig.BOOLEAN(0);
		/** @param override renderer used */
		renderer = ParamConfig.NODE_PATH('', {
			visibleIf: {setRenderer: 1},
			nodeSelection: {
				context: NodeContext.ROP,
				types: [RopType.WEBGL],
			},
			dependentOnFoundNode: true,
		});

		/** @param toggle on to add a CSSRenderer to have html elements on top of the 3D objects */
		setCSSRenderer = ParamConfig.BOOLEAN(0);
		/** @param add a css renderer */
		CSSRenderer = ParamConfig.NODE_PATH('', {
			visibleIf: {setCSSRenderer: 1},
			nodeSelection: {
				context: NodeContext.ROP,
				types: [RopType.CSS2D, RopType.CSS3D],
			},
			dependentOnFoundNode: true,
		});
	};
}
