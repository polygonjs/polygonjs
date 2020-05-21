import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {TextureMapParamConfig, TextureMapController} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig, TextureAlphaMapController} from './utils/TextureAlphaMapController';
import {ShaderAssemblerBasic} from '../gl/code/assemblers/materials/Basic';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {GlAssemblerController} from '../gl/code/Controller';
class MeshBasicMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

export class MeshBasicBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerBasic, MeshBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_basic_builder';
	}

	readonly texture_map_controller: TextureMapController = new TextureMapController(this, {uniforms: true});
	readonly texture_alpha_map_controller: TextureAlphaMapController = new TextureAlphaMapController(this, {
		uniforms: true,
	});
	initialize_node() {
		this.params.on_params_created(() => {
			this.texture_map_controller.initialize_node();
			this.texture_alpha_map_controller.initialize_node();
		});
	}

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerBasic>(this, ShaderAssemblerBasic);
	}

	async cook() {
		this.compile_if_required();

		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		TextureMapController.update(this);
		TextureAlphaMapController.update(this);

		this.set_material(this.material);
	}
}
