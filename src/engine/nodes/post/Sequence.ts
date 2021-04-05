import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class SequencePostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SequencePostParamsConfig();
export class SequencePostNode extends TypedPostProcessNode<Pass, SequencePostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'sequence';
	}

	initializeNode() {
		super.initializeNode();
		this.io.inputs.setCount(0, 4);
	}

	setupComposer(context: TypedPostNodeContext): void {
		this._addPassFromInput(0, context);
		this._addPassFromInput(1, context);
		this._addPassFromInput(2, context);
		this._addPassFromInput(3, context);
	}
}
