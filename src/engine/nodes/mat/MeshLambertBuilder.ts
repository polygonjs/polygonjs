import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {TextureMapParamConfig, TextureMapController} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig, TextureAlphaMapController} from './utils/TextureAlphaMapController';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {ShaderAssemblerLambert} from '../gl/code/assemblers/materials/Lambert';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';

class MeshLambertMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new MeshLambertMatParamsConfig();

export class MeshLambertBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerLambert, MeshLambertMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_lambert_builder';
	}
	public used_assembler(): Readonly<AssemblerName.GL_MESH_LAMBERT> {
		return AssemblerName.GL_MESH_LAMBERT;
	}
	protected _create_assembler_controller() {
		return Poly.instance().assemblers_register.assembler(this, this.used_assembler());
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
