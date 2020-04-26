import {TypedJsNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {LinesController} from './code/utils/LinesController';
class GlobalsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsJsParamsConfig();

export class GlobalsJsNode extends TypedJsNode<GlobalsJsParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'globals';
	}

	create_params() {
		this.function_node?.assembler_controller.add_globals_params(this);
	}

	set_lines(lines_controller: LinesController) {
		this.function_node?.assembler_controller?.assembler.set_node_lines_globals(this, lines_controller);
	}
}
