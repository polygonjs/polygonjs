/**
 * Creates a ring.
 *
 * @remarks
 * If the node has no input, you can control the radius and center of the ring. If the node has an input, it will create a ring that encompasses the input geometry.
 *
 */

import {TypedSopNode} from './_Base';
import {RingSopOperation} from '../../operations/sop/Ring';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = RingSopOperation.DEFAULT_PARAMS;
const step = 0.00001;
class RingSopParamsConfig extends NodeParamsConfig {
	/** @param inner radius of the ring */
	innerRadius = ParamConfig.FLOAT(DEFAULT.innerRadius);
	/** @param outer radius of the ring */
	outerRadius = ParamConfig.FLOAT(DEFAULT.outerRadius);
	/** @param segments count */
	thetaSegments = ParamConfig.INTEGER(DEFAULT.thetaSegments, {
		range: [0, 128],
		rangeLocked: [true, false],
	});
	/** @param segments count */
	phiSegments = ParamConfig.INTEGER(DEFAULT.phiSegments, {
		range: [0, 4],
		rangeLocked: [true, false],
	});
	/** @param if set to 1, you can then set the phiStart, phi_end, thetaStart and theta_end */
	open = ParamConfig.BOOLEAN(DEFAULT.open);
	/** @param start of phi angle */
	angleStart = ParamConfig.FLOAT(DEFAULT.angleStart, {
		range: [0, Math.PI * 2],
		step,
		visibleIf: {open: true},
	});
	/** @param length of phi opening */
	angleLength = ParamConfig.FLOAT('$PI*2', {
		range: [0, Math.PI * 2],
		step,
		visibleIf: {open: true},
	});
	/** @param axis perpendicular to the plane */
	direction = ParamConfig.VECTOR3(DEFAULT.direction, {
		separatorBefore: true,
	});
	/** @param center of the plane */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new RingSopParamsConfig();

export class RingSopNode extends TypedSopNode<RingSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'ring';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
		// this.io.inputs.initInputsClonedState(RingSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: RingSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new RingSopOperation(this.scene(), this.states, this);
		const core_group = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(core_group);
	}
}
