/**
 * Allows to access global variables
 *
 *
 */
import {TypedGlNode} from './_Base';
import {GlType} from './../../poly/registers/nodes/types/Gl';
// list of globals
// https://www.khronos.org/opengl/wiki/Built-in_Variable_(GLSL)
// gl_PointCoord

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
class GlobalsGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsGlParamsConfig();

export class GlobalsGlNode extends TypedGlNode<GlobalsGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.GLOBALS;
	}

	override initializeNode() {
		super.initializeNode();

		this.lifecycle.onAfterAdded(() => {
			this.materialNode()?.assemblerController()?.add_globals_outputs(this);
		});
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const assembler = shaders_collection_controller.assembler() as BaseGlShaderAssembler;
		assembler.set_node_lines_globals(this, shaders_collection_controller);
	}
}
