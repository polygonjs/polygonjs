/**
 * Subdivides a geometry
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SubdivideSopOperation} from '../../operations/sop/Subdivide';
const DEFAULT = SubdivideSopOperation.DEFAULT_PARAMS;
class SubdivideSopParamsConfig extends NodeParamsConfig {
	/** @param number of subdivisions */
	subdivisions = ParamConfig.INTEGER(DEFAULT.subdivisions, {
		range: [0, 5],
		rangeLocked: [true, false],
	});
	/** @param merge vertices */
	mergeVertices = ParamConfig.BOOLEAN(DEFAULT.mergeVertices);
}
const ParamsConfig = new SubdivideSopParamsConfig();

export class SubdivideSopNode extends TypedSopNode<SubdivideSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'subdivide';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _operation: SubdivideSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new SubdivideSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
