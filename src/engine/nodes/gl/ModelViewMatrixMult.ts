import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ShaderName} from '../utils/shaders/ShaderName';
import {ThreeToGl} from '../../../core/ThreeToGl';

const OUTPUT_NAME = 'mvMult';

class ModelViewMatrixMultGlParamsConfig extends NodeParamsConfig {
	vector = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new ModelViewMatrixMultGlParamsConfig();
export class ModelViewMatrixMultGlNode extends TypedGlNode<ModelViewMatrixMultGlParamsConfig> {
	params_config = ParamsConfig;
	static type(): Readonly<'modelViewMatrixMult'> {
		return 'modelViewMatrixMult';
	}

	initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC4),
		]);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		if (shaders_collection_controller.current_shader_name == ShaderName.VERTEX) {
			const input = ThreeToGl.vector3(this.variable_for_input('vector'));
			const out_value = this.gl_var_name(OUTPUT_NAME);
			const body_line = `vec4 ${out_value} = modelViewMatrix * vec4(${input}, 1.0)`;
			shaders_collection_controller.add_body_lines(this, [body_line], ShaderName.VERTEX);
		}
	}
}
