import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from '../../cop/File';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
export function TextureEnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_env_map = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureEnvMapController));
		env_map = ParamConfig.OPERATOR_PATH(
			FileCopNode.DEFAULT_NODE_PATH.ENV_MAP,
			OperatorPathOptions(TextureEnvMapController, 'use_env_map')
		);
		env_map_intensity = ParamConfig.FLOAT(1, {visible_if: {use_env_map: 1}});
	};
}
class TextureEnvMaterial extends Material {
	envMap!: Texture | null;
}
type CurrentMaterial = TextureEnvMaterial | ShaderMaterial;
class TextureEnvMapParamsConfig extends TextureEnvMapParamConfig(NodeParamsConfig) {}
abstract class TextureEnvMapMatNode extends TypedMatNode<CurrentMaterial, TextureEnvMapParamsConfig> {
	texture_env_map_controller!: TextureEnvMapController;
	abstract create_material(): CurrentMaterial;
}

export class TextureEnvMapController extends BaseTextureMapController {
	constructor(node: TextureEnvMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initialize_node() {
		this.add_hooks(this.node.p.use_env_map, this.node.p.env_map);
	}
	async update() {
		this._update(this.node.material, 'envMap', this.node.p.use_env_map, this.node.p.env_map);
	}
	static async update(node: TextureEnvMapMatNode) {
		node.texture_env_map_controller.update();
	}
}
