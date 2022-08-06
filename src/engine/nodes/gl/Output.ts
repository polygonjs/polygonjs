/**
 * Allows to set the result of the shader
 *
 *
 */
import {GlType} from './../../poly/registers/nodes/types/Gl';
import {TypedGlNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
class OutputGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputGlParamsConfig();

export class OutputGlNode extends TypedGlNode<OutputGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.OUTPUT;
	}

	override initializeNode() {
		super.initializeNode();
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));

		this.lifecycle.onAfterAdded(() => {
			this.materialNode()?.assemblerController()?.add_output_inputs(this);
			this._setMatToRecompile();
		});
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		// if (shaders_collection_controller.shader_name) {
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		assembler.set_node_lines_output(this, shaders_collection_controller);
		// }
	}

	// set_color_declaration(color_declaration: string){
	// 	this._color_declaration = color_declaration
	// }
}
