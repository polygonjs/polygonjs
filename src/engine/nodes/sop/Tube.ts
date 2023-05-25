/**
 * Creates a tube.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TubeSopOperation} from '../../operations/sop/Tube';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = TubeSopOperation.DEFAULT_PARAMS;
const step = 0.00001;
class TubeSopParamsConfig extends NodeParamsConfig {
	/** @param top radius */
	radiusTop = ParamConfig.FLOAT(DEFAULT.radiusTop, {range: [0, 1]});
	/** @param bottom radius */
	radiusBottom = ParamConfig.FLOAT(DEFAULT.radiusBottom, {range: [0, 1]});
	/** @param tube height */
	height = ParamConfig.FLOAT(DEFAULT.height, {range: [0, 1]});
	/** @param number of segments in the radial direction */
	segmentsRadial = ParamConfig.INTEGER(DEFAULT.segmentsRadial, {range: [3, 50], rangeLocked: [true, false]});
	/** @param number of segments in the height direction */
	segmentsHeight = ParamConfig.INTEGER(DEFAULT.segmentsHeight, {range: [1, 20], rangeLocked: [true, false]});
	/** @param adds caps */
	cap = ParamConfig.BOOLEAN(1);
	/** @param center of the tube */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param direction of the tube */
	direction = ParamConfig.VECTOR3([0, 0, 1]);
	/** @param if set to 1, you can then set the phiStart, phi_end, thetaStart and theta_end */
	open = ParamConfig.BOOLEAN(DEFAULT.open);
	/** @param start of theta angle */
	thetaStart = ParamConfig.FLOAT(DEFAULT.thetaStart, {
		visibleIf: {open: 1},
		range: [0, Math.PI * 2],
		step,
	});
	/** @param length of theta opening */
	thetaLength = ParamConfig.FLOAT('$PI*2', {
		visibleIf: {open: 1},
		range: [0, Math.PI * 2],
		step,
	});
}
const ParamsConfig = new TubeSopParamsConfig();

export class TubeSopNode extends TypedSopNode<TubeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TUBE;
	}

	private _operation: TubeSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new TubeSopOperation(this._scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
