/**
 * This node does not change the input geometry.
 *
 * @remarks
 * It can still be used to keep a copy of the input geometry, in case downstream nodes were to process it without cloning.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NullSopOperation} from '../../../core/operations/sop/Null';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullSopParamsConfig();

export class NullSopNode extends TypedSopNode<NullSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'null';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
		this.io.inputs.init_inputs_cloned_state(NullSopOperation.INPUT_CLONED_STATE);
		// this.uiData.set_border_radius(1000);
	}

	private _operation: NullSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new NullSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
