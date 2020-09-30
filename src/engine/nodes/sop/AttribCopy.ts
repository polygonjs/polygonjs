import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AttribCopySopOperation} from '../../../core/operation/sop/AttribCopy';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AttribCopySopOperation.DEFAULT_PARAMS;
class AttribCopySopParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING(DEFAULT.name);
	tnew_name = ParamConfig.BOOLEAN(DEFAULT.tnew_name);
	new_name = ParamConfig.STRING(DEFAULT.new_name, {visible_if: {tnew_name: 1}});

	src_offset = ParamConfig.INTEGER(DEFAULT.src_offset, {
		range: [0, 3],
		range_locked: [true, true],
	});
	dest_offset = ParamConfig.INTEGER(DEFAULT.dest_offset, {
		range: [0, 3],
		range_locked: [true, true],
	});
}
const ParamsConfig = new AttribCopySopParamsConfig();

// TODO: attrib copy should handle string attributes
export class AttribCopySopNode extends TypedSopNode<AttribCopySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attrib_copy';
	}

	static displayed_input_names(): string[] {
		return ['geometry to copy attributes to', 'geometry to copy attributes from'];
	}

	initialize_node() {
		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_cloned_state(AttribCopySopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AttribCopySopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AttribCopySopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
