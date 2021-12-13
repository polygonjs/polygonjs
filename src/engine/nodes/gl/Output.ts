/**
 * Allows to set the result of the shader
 *
 *
 */
import {TypedGlNode} from './_Base';
// import {ThreeToGl} from '../../../Core/ThreeToGl';
// import {CodeBuilder} from './Util/CodeBuilder'
// import {Definition} from './Definition/_Module';
// import {ShaderName, LineType, LINE_TYPES} from './Assembler/Util/CodeBuilder';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
class OutputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputGlParamsConfig();

export class OutputGlNode extends TypedGlNode<OutputGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'output';
	}

	initializeNode() {
		super.initializeNode();
		this.addPostDirtyHook('_set_mat_to_recompile', this._set_mat_to_recompile.bind(this));

		this.lifecycle.onAdd(() => {
			this.material_node?.assemblerController?.add_output_inputs(this);
		});
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		// if (shaders_collection_controller.shader_name) {
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		assembler.set_node_lines_output(this, shaders_collection_controller);
		// }
	}

	// set_color_declaration(color_declaration: string){
	// 	this._color_declaration = color_declaration
	// }
}
