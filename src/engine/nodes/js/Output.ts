import {TypedJsNode} from './_Base';
// import {ThreeToGl} from '../../../Core/ThreeToGl';
// import {CodeBuilder} from './Util/CodeBuilder'
// import {Definition} from './Definition/_Module';
// import {ShaderName, LineType, LINE_TYPES} from './Assembler/Util/CodeBuilder';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {LinesController} from './code/utils/LinesController';
class OutputJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputJsParamsConfig();

export class OutputJsNode extends TypedJsNode<OutputJsParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'output';
	}

	initializeNode() {
		super.initializeNode();
		this.addPostDirtyHook('_set_mat_to_recompile', this._set_function_node_to_recompile.bind(this));
	}

	createParams() {
		this.function_node?.assembler_controller.add_output_inputs(this);
	}

	setLines(lines_controller: LinesController) {
		this.function_node?.assembler_controller.assembler.set_node_lines_output(this, lines_controller);
	}
}
