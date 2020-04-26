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
	params_config = ParamsConfig;
	static type() {
		return 'output';
	}

	initialize_node() {
		super.initialize_node();
		this.add_post_dirty_hook('_set_mat_to_recompile', this._set_function_node_to_recompile.bind(this));
	}

	create_params() {
		this.function_node?.assembler_controller.add_output_params(this);
	}

	set_lines(lines_controller: LinesController) {
		this.function_node?.assembler_controller.assembler.set_node_lines_output(this, lines_controller);
	}
}
