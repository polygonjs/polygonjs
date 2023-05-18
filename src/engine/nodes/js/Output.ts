/**
 * sets globals properties of the current object or point
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
class OutputJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputJsParamsConfig();

export class OutputJsNode extends TypedJsNode<OutputJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.OUTPUT;
	}

	override initializeNode() {
		super.initializeNode();

		this.lifecycle.onAfterAdded(() => {
			this.functionNode()?.assemblerController()?.add_output_inputs(this);
		});
	}

	override setLines(linesController: JsLinesCollectionController) {
		this.functionNode()?.assemblerController()?.assembler.setNodeLinesOutput(this, linesController);
	}
}
