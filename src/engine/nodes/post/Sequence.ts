/**
 * Allows to sequence several passes
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext} from './_Base';
import {Pass} from 'postprocessing';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class SequencePostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SequencePostParamsConfig();
export class SequencePostNode extends TypedPostNode<Pass, SequencePostParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sequence';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(0, 4);
	}

	override setupComposer(context: TypedPostNodeContext) {
		this._addPassFromInput(0, context);
		this._addPassFromInput(1, context);
		this._addPassFromInput(2, context);
		this._addPassFromInput(3, context);
	}
}
