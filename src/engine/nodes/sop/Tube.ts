/**
 * Creates a tube.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TubeSopOperation} from '../../operations/sop/Tube';
import {CoreGroup} from '../../../core/geometry/Group';
class TubeSopParamsConfig extends NodeParamsConfig {
	/** @param top radius */
	radiusTop = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param bottom radius */
	radiusBottom = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param tube height */
	height = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param number of segments in the radial direction */
	segmentsRadial = ParamConfig.INTEGER(12, {range: [3, 20], rangeLocked: [true, false]});
	/** @param number of segments in the height direction */
	segmentsHeight = ParamConfig.INTEGER(1, {range: [1, 20], rangeLocked: [true, false]});
	/** @param adds caps */
	cap = ParamConfig.BOOLEAN(1);
	/** @param center of the tube */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param direction of the tube */
	direction = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new TubeSopParamsConfig();

export class TubeSopNode extends TypedSopNode<TubeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'tube';
	}

	private _operation: TubeSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TubeSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
