import {TypedJsNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesController} from './code/utils/LinesController';
class GlobalsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsJsParamsConfig();

export class GlobalsJsNode extends TypedJsNode<GlobalsJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'globals';
	}

	override createParams() {
		this.function_node?.assembler_controller.add_globals_outputs(this);
	}

	override setLines(lines_controller: JsLinesController) {
		this.function_node?.assembler_controller?.assembler.set_node_lines_globals(this, lines_controller);
	}
}
