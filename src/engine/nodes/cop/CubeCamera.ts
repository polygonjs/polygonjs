/**
 * Creates a Texture from a CubeCamera
 *
 *	@remarks
 *
 * See the [COP/CubeCamera](https://polygonjs.com/docs/nodes/cop/CubeCamera) on how to use it as a texture.
 */

import {TypedCopNode} from './_Base';
import {CubeCameraObjNode} from '../obj/CubeCamera';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {ObjType} from '../../poly/registers/nodes/types/Obj';

class EnvMapCopParamsConfig extends NodeParamsConfig {
	/** @param cube camera OBJ node */
	cubeCamera = ParamConfig.NODE_PATH('/cubeCamera1', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [ObjType.CUBE_CAMERA],
		},
	});
}
const ParamsConfig = new EnvMapCopParamsConfig();
export class CubeCameraCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'cubeCamera';
	}

	async cook() {
		const cubeCameraNode = this.pv.cubeCamera.ensureNodeContext(NodeContext.OBJ, this.states.error);
		if (!cubeCameraNode) {
			this.states.error.set(`cubeCamera not found at '${this.pv.cubeCamera.path()}'`);
			return this.cookController.endCook();
		}
		const renderTarget = (cubeCameraNode as CubeCameraObjNode).renderTarget();
		if (!renderTarget) {
			this.states.error.set(`cubeCamera has no render target'`);
			return this.cookController.endCook();
		}
		this.set_texture(renderTarget.texture);
	}
}
