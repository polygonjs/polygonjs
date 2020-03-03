import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {TextureMapParamConfig, TextureMapController} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig, TextureAlphaMapController} from './utils/TextureAlphaMapController';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {GlAssemblerController} from '../gl/code/Controller';
import {NodeContext} from '../../poly/NodeContext';
import {ShaderAssemblerLambert} from '../gl/code/assemblers/materials/Lambert';

class MeshLambertMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new MeshLambertMatParamsConfig();

export class MeshLambertBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerLambert, MeshLambertMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_lambert_builder';
	}

	readonly texture_map_controller: TextureMapController = new TextureMapController(this, {uniforms: true});
	readonly texture_alpha_map_controller: TextureAlphaMapController = new TextureAlphaMapController(this, {
		uniforms: true,
	});
	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
		this.params.set_post_create_params_hook(() => {
			this.texture_map_controller.initialize_node();
			this.texture_alpha_map_controller.initialize_node();
		});
		this.children_controller?.init();
	}

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerLambert>(this, ShaderAssemblerLambert);
	}

	async cook() {
		await this.compile_if_required();

		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		await TextureMapController.update(this);
		await TextureAlphaMapController.update(this);

		this.set_material(this.material);
	}

	protected async _compile() {
		if (this._material) {
			await this.assembler_controller.assembler.compile_material(this._material);
			await this.assembler_controller.post_compile();
		}
	}
}
