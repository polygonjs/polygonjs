import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {NODE_PATH_DEFAULT} from '../../../../core/Walker';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
export function TextureEnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		useEnvMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureEnvMapController));
		envMap = ParamConfig.OPERATOR_PATH(
			NODE_PATH_DEFAULT.NODE.ENV_MAP,
			OperatorPathOptions(TextureEnvMapController, 'useEnvMap')
		);
		envMapIntensity = ParamConfig.FLOAT(1, {visibleIf: {useEnvMap: 1}});
	};
}
// class TextureEnvMaterial extends Material {
// 	envMap!: Texture | null;
// 	envMapIntensity!: number;
// }
type CurrentMaterial = MeshStandardMaterial | ShaderMaterial;
class TextureEnvMapParamsConfig extends TextureEnvMapParamConfig(NodeParamsConfig) {}
abstract class TextureEnvMapMatNode extends TypedMatNode<CurrentMaterial, TextureEnvMapParamsConfig> {
	texture_env_map_controller!: TextureEnvMapController;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureEnvMapController extends BaseTextureMapController {
	constructor(protected node: TextureEnvMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
	}
	async update() {
		this._update(this.node.material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.envMapIntensity.value = this.node.pv.envMapIntensity;
		}
		if (this._update_options.direct_params) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.envMapIntensity = this.node.pv.envMapIntensity;
		}
	}
	static async update(node: TextureEnvMapMatNode) {
		node.texture_env_map_controller.update();
	}
}
