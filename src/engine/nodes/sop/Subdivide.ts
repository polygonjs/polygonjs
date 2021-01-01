/**
 * Subdivides a geometry
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SubdivideSopOperation} from '../../../core/operations/sop/Subdivide';
const DEFAULT = SubdivideSopOperation.DEFAULT_PARAMS;
class SubdivideSopParamsConfig extends NodeParamsConfig {
	/** @param number of subdivisions */
	subdivisions = ParamConfig.INTEGER(DEFAULT.subdivisions, {
		range: [0, 5],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SubdivideSopParamsConfig();

export class SubdivideSopNode extends TypedSopNode<SubdivideSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'subdivide';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	private _operation: SubdivideSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SubdivideSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
