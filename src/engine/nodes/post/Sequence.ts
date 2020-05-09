import {TypedPostProcessNode, TypedPostNodeContext} from './_Base';
import {RenderPass} from '../../../../modules/three/examples/jsm/postprocessing/RenderPass';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class SequencePostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SequencePostParamsConfig();
export class SequencePostNode extends TypedPostProcessNode<RenderPass, SequencePostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'sequence';
	}

	initialize_node() {
		super.initialize_node();
		this.io.inputs.set_count(0, 4);
		this.ui_data.set_width(100);
	}

	setup_composer(context: TypedPostNodeContext): void {
		this._add_pass_from_input(0, context);
		this._add_pass_from_input(1, context);
		this._add_pass_from_input(2, context);
		this._add_pass_from_input(3, context);
	}
}
