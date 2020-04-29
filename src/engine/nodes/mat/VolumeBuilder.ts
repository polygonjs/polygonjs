import {TypedBuilderMatNode} from './_BaseBuilder';
import {ShaderAssemblerVolume} from '../gl/code/assemblers/materials/Volume';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlAssemblerController} from '../gl/code/Controller';
import {VolumeController} from './utils/VolumeController';
class VolumeMatParamsConfig extends NodeParamsConfig {
	color = ParamConfig.COLOR([1, 1, 1]);
	step_size = ParamConfig.FLOAT(0.01);
	density = ParamConfig.FLOAT(1);
	shadow_density = ParamConfig.FLOAT(1);
	light_dir = ParamConfig.VECTOR3([-1, -1, -1]);
}
const ParamsConfig = new VolumeMatParamsConfig();

export class VolumeBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerVolume, VolumeMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'volume_builder';
	}
	private _volume_controller = new VolumeController(this);

	protected _create_assembler_controller() {
		return new GlAssemblerController<ShaderAssemblerVolume>(this, ShaderAssemblerVolume);
	}
	initialize_node() {}
	async cook() {
		this.compile_if_required();

		this._volume_controller.update_uniforms_from_params();

		this.set_material(this.material);
	}
}
