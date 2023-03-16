import {TypedJsNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
class GlobalsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsJsParamsConfig();

export class GlobalsJsNode extends TypedJsNode<GlobalsJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GLOBALS;
	}

	override initializeNode() {
		super.initializeNode();

		this.lifecycle.onAfterAdded(() => {
			this.functionNode()?.assemblerController()?.add_globals_outputs(this);
		});
	}

	override setLines(linesController: ShadersCollectionController) {
		this.functionNode()?.assemblerController()?.assembler.set_node_lines_globals(this, linesController);
	}
}
