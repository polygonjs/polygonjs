import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import DiskMethods from './gl/disk.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class SphereGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
	feather = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SphereGlParamsConfig();
export class SphereGlNode extends TypedGlNode<SphereGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'sphere';
	}

	initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const position = ThreeToGl.vector2(this.variable_for_input('position'));
		const center = ThreeToGl.vector2(this.variable_for_input('center'));
		const radius = ThreeToGl.float(this.variable_for_input('radius'));
		const feather = ThreeToGl.float(this.variable_for_input('feather'));

		const float = this.gl_var_name('float');
		const body_line = `float ${float} = disk3d(${position}, ${center}, ${radius}, ${feather})`;
		shaders_collection_controller.add_body_lines(this, [body_line]);

		shaders_collection_controller.add_definitions(this, [new FunctionGLDefinition(this, DiskMethods)]);
	}
}
