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

import {CubeReflectionMapping, CubeRefractionMapping} from 'three/src/constants';
import {CopType} from '../../poly/registers/nodes/types/Cop';

enum MapMode {
	REFLECTION = 'reflection',
	REFRACTION = 'refraction',
}
const MAP_MODES: MapMode[] = [MapMode.REFLECTION, MapMode.REFRACTION];
class EnvMapCopParamsConfig extends NodeParamsConfig {
	/** @param cube camera OBJ node */
	cubeCamera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [ObjType.CUBE_CAMERA],
		},
	});
	/** @param defines if the texture is used for reflection or refraction */
	mode = ParamConfig.INTEGER(0, {
		menu: {
			entries: MAP_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
}
const ParamsConfig = new EnvMapCopParamsConfig();
export class CubeCameraCopNode extends TypedCopNode<EnvMapCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return CopType.CUBE_CAMERA;
	}

	async cook() {
		const cubeCameraNode = this.pv.cubeCamera.nodeWithContext(NodeContext.OBJ, this.states.error);
		if (!cubeCameraNode) {
			this.states.error.set(`cubeCamera not found at '${this.pv.cubeCamera.path()}'`);
			return this.cookController.endCook();
		}
		const renderTarget = (cubeCameraNode as CubeCameraObjNode).renderTarget();
		if (!renderTarget) {
			this.states.error.set(`cubeCamera has no render target'`);
			return this.cookController.endCook();
		}
		const texture = renderTarget.texture;
		if (MAP_MODES[this.pv.mode] == MapMode.REFLECTION) {
			texture.mapping = CubeReflectionMapping;
		} else {
			texture.mapping = CubeRefractionMapping;
		}
		this.setTexture(texture);
	}
}
