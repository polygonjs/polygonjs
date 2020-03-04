import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {ShaderAssemblerPoints} from '../gl/code/assemblers/materials/Points';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {GlAssemblerController} from '../gl/code/Controller';
class PointsMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new PointsMatParamsConfig();

export class PointsBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerPoints, PointsMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'points_builder';
	}

	initialize_node() {}

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerPoints>(this, ShaderAssemblerPoints);
	}

	async cook() {
		await this.compile_if_required();

		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);

		this.set_material(this.material);
	}
}
