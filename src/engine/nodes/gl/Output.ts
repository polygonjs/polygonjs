import {TypedGlNode} from './_Base';
// import {ThreeToGl} from '../../../Core/ThreeToGl';
// import {CodeBuilder} from './Util/CodeBuilder'
// import {Definition} from './Definition/_Module';
// import {ShaderName, LineType, LINE_TYPES} from './Assembler/Util/CodeBuilder';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
class OutputGlParamsConfig extends NodeParamsConfig {
	// type = ParamConfig.INTEGER(0, {
	// 	menu: {
	// 		entries: ConnectionPointTypes.map((name, i) => {
	// 			return {name: name, value: i};
	// 		}),
	// 	},
	// });
	// value_float = ParamConfig.FLOAT(0, ConstantGlNode.typed_visible_options(ConnectionPointType.FLOAT));
	// value_vec2 = ParamConfig.VECTOR2([0, 0], ConstantGlNode.typed_visible_options(ConnectionPointType.VEC2));
	// value_vec3 = ParamConfig.VECTOR3([0, 0, 0], ConstantGlNode.typed_visible_options(ConnectionPointType.VEC3));
	// value_vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], ConstantGlNode.typed_visible_options(ConnectionPointType.VEC4));
}
const ParamsConfig = new OutputGlParamsConfig();

export class OutputGlNode extends TypedGlNode<OutputGlParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'output';
	}

	create_params() {
		this.material_node?.assembler_controller.add_output_params(this);
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		// if (shaders_collection_controller.shader_name) {
		this.material_node?.assembler_controller.assembler.set_node_lines_output(this, shaders_collection_controller);
		// }
	}

	// set_color_declaration(color_declaration: string){
	// 	this._color_declaration = color_declaration
	// }
}
