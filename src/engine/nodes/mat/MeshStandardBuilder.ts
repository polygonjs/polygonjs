import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {TextureMapParamConfig, TextureMapController} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig, TextureAlphaMapController} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapController';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {GlAssemblerController} from '../gl/code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {ShaderAssemblerStandard} from '../gl/code/assemblers/materials/Standard';

import {SHADER_DEFAULTS} from './MeshStandard';

class MeshStandardMatParamsConfig extends TextureEnvMapParamConfig(
	TextureAlphaMapParamConfig(
		TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
	)
) {
	metalness = ParamConfig.FLOAT(SHADER_DEFAULTS.metalness);
	roughness = ParamConfig.FLOAT(SHADER_DEFAULTS.roughness);
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
	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
		this.params.set_post_create_params_hook(() => {
			this.texture_map_controller.initialize_node();
			this.texture_alpha_map_controller.initialize_node();
			this.texture_env_map_controller.initialize_node();
		});
		this.children_controller?.init();
	}

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerStandard>(this, ShaderAssemblerStandard);
	}

	async cook() {
		await this.compile_if_required();

		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		await TextureMapController.update(this);
		await TextureAlphaMapController.update(this);
		await TextureEnvMapController.update(this);

		if (this._material) {
			this._material.uniforms.envMapIntensity.value = this.pv.env_map_intensity;
			this._material.uniforms.roughness.value = this.pv.roughness;
			this._material.uniforms.metalness.value = this.pv.metalness;
			this._material.needsUpdate = true;
		}

		this.set_material(this.material);
	}

	protected async _compile() {
		if (this._material) {
			await this.assembler_controller.assembler.compile_material(this._material);
			await this.assembler_controller.post_compile();
		}
	}
}
