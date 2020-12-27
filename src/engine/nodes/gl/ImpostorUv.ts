import Quaternion from './gl/quaternion.glsl';
import Impostor from './gl/impostor.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'uv';
class ImpostorUvGlParamsConfig extends NodeParamsConfig {
	center = ParamConfig.VECTOR3([0, 0, 0]);
	camera_pos = ParamConfig.VECTOR3([0, 0, 0]);
	uv = ParamConfig.VECTOR2([0, 0]);
	tiles_count = ParamConfig.INTEGER(8, {
		range: [0, 32],
		rangeLocked: [true, false],
	});
	offset = ParamConfig.FLOAT(0);
}
const ParamsConfig = new ImpostorUvGlParamsConfig();
export class ImpostorUvGlNode extends TypedGlNode<ImpostorUvGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'impostorUv';
	}
	initialize_node() {
		super.initialize_node();

		this.io.outputs.set_named_output_connection_points([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC2),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];

		shaders_collection_controller.add_definitions(this, [
			new FunctionGLDefinition(this, Quaternion),
			new FunctionGLDefinition(this, Impostor),
		]);

		const center = ThreeToGl.vector3(this.variable_for_input(this.p.center.name));
		const camera_pos = ThreeToGl.vector3(this.variable_for_input(this.p.camera_pos.name));
		const uv = ThreeToGl.vector2(this.variable_for_input(this.p.uv.name));
		const tiles_count = ThreeToGl.float(this.variable_for_input(this.p.tiles_count.name));
		const offset = ThreeToGl.float(this.variable_for_input(this.p.offset.name));

		const impostor_uv = this.gl_var_name(OUTPUT_NAME);
		const args = [center, camera_pos, uv, tiles_count, offset].join(', ');
		body_lines.push(`vec2 ${impostor_uv} = impostor_uv(${args})`);

		shaders_collection_controller.add_body_lines(this, body_lines);
	}
}
