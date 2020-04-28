import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {TextureMapParamConfig, TextureMapController} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig, TextureAlphaMapController} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapController';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {GlAssemblerController} from '../gl/code/Controller';
import {ShaderAssemblerStandard} from '../gl/code/assemblers/materials/Standard';
import {BaseParamType} from '../../params/_Base';
import {BaseNodeType} from '../_Base';

import {SHADER_DEFAULTS} from './MeshStandard';

class MeshStandardMatParamsConfig extends TextureEnvMapParamConfig(
	TextureAlphaMapParamConfig(
		TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
	)
) {
	metalness = ParamConfig.FLOAT(SHADER_DEFAULTS.metalness, {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) =>
			MeshStandardBuilderMatNode._update_metalness(node as MeshStandardBuilderMatNode),
	});
	roughness = ParamConfig.FLOAT(SHADER_DEFAULTS.roughness, {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) =>
			MeshStandardBuilderMatNode._update_roughness(node as MeshStandardBuilderMatNode),
	});
}
const ParamsConfig = new MeshStandardMatParamsConfig();

export class MeshStandardBuilderMatNode extends TypedBuilderMatNode<
	ShaderAssemblerStandard,
	MeshStandardMatParamsConfig
> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_standard_builder';
	}

	readonly texture_map_controller: TextureMapController = new TextureMapController(this, {uniforms: true});
	readonly texture_alpha_map_controller: TextureAlphaMapController = new TextureAlphaMapController(this, {
		uniforms: true,
	});
	readonly texture_env_map_controller: TextureEnvMapController = new TextureEnvMapController(this, {
		uniforms: true,
		direct_params: true,
		define: false,
	});
	initialize_node() {
		this.params.set_post_create_params_hook(() => {
			this.texture_map_controller.initialize_node();
			this.texture_alpha_map_controller.initialize_node();
			this.texture_env_map_controller.initialize_node();
		});
	}

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerStandard>(this, ShaderAssemblerStandard);
	}

	async cook() {
		this.compile_if_required();

		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		TextureMapController.update(this);
		TextureAlphaMapController.update(this);
		TextureEnvMapController.update(this);

		if (this._material) {
			this._material.uniforms.envMapIntensity.value = this.pv.env_map_intensity;
			MeshStandardBuilderMatNode._update_metalness(this);
			MeshStandardBuilderMatNode._update_roughness(this);
		}

		this.set_material(this.material);
	}
	static _update_metalness(node: MeshStandardBuilderMatNode) {
		node.material.uniforms.metalness.value = node.pv.metalness;
	}
	static _update_roughness(node: MeshStandardBuilderMatNode) {
		node.material.uniforms.roughness.value = node.pv.roughness;
	}
}
