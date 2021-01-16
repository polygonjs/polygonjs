/**
 * Creates a Torus Knot.
 *
 * @remarks
 * The Torus Knot is akin to the Torus, except that you can create more complex shapes by using the `p` and `q` paramters.
 *
 */

import {TypedSopNode} from './_Base';
import {TorusKnotSopOperation} from '../../../core/operations/sop/TorusKnot';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = TorusKnotSopOperation.DEFAULT_PARAMS;
class TorusKnotSopParamsConfig extends NodeParamsConfig {
	/** @param large radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	/** @param radius of the tube */
	radiusTube = ParamConfig.FLOAT(DEFAULT.radiusTube);
	/** @param number of segments along the length of the torus */
	segmentsRadial = ParamConfig.INTEGER(DEFAULT.segmentsRadial, {range: [1, 128]});
	/** @param number of segments along the tube */
	segmentsTube = ParamConfig.INTEGER(DEFAULT.segmentsTube, {range: [1, 32]});
	/** @param change this to create more interesting shapes. Don't ask me what it is exactly, I don't know! */
	p = ParamConfig.INTEGER(DEFAULT.p, {range: [1, 10]});
	/** @param change this to create more interesting shapes. Don't ask me what it is exactly, I don't know! */
	q = ParamConfig.INTEGER(DEFAULT.q, {range: [1, 10]});
	/** @param center of the torus knot */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new TorusKnotSopParamsConfig();

export class TorusKnotSopNode extends TypedSopNode<TorusKnotSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'torusKnot';
	}
	initializeNode() {}

	private _operation: TorusKnotSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TorusKnotSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
