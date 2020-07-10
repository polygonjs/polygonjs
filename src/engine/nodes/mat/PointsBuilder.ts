import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorParamConfig, ColorsController} from './utils/UniformsColorsController';
import {SideParamConfig, SideController} from './utils/SideController';
import {SkinningParamConfig, SkinningController} from './utils/SkinningController';
import {ShaderAssemblerPoints} from '../gl/code/assemblers/materials/Points';
import {TypedBuilderMatNode} from './_BaseBuilder';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
class PointsMatParamsConfig extends SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))) {}
const ParamsConfig = new PointsMatParamsConfig();

export class PointsBuilderMatNode extends TypedBuilderMatNode<ShaderAssemblerPoints, PointsMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'points_builder';
	}
	public used_assembler(): Readonly<AssemblerName.GL_POINTS> {
		return AssemblerName.GL_POINTS;
	}
	protected _create_assembler_controller() {
		return Poly.instance().assemblers_register.assembler(this, this.used_assembler());
	}

	initialize_node() {}

	async cook() {
		this.compile_if_required();

		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);

		this.set_material(this.material);
	}
}
