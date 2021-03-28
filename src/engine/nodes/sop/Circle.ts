/**
 * Creates a circle.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CircleSopOperation} from '../../operations/sop/Circle';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = CircleSopOperation.DEFAULT_PARAMS;
class CircleSopParamsConfig extends NodeParamsConfig {
	/** @param circle radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius);
	/** @param segments count */
	segments = ParamConfig.INTEGER(DEFAULT.segments, {
		range: [1, 50],
		rangeLocked: [true, false],
	});
	/** @param toggle on to have an arc instead of a closed circle */
	open = ParamConfig.BOOLEAN(DEFAULT.open);
	/** @param angle fo the arc */
	arcAngle = ParamConfig.FLOAT(DEFAULT.arcAngle, {
		range: [0, 360],
		rangeLocked: [false, false],
		visibleIf: {open: 1},
	});
	/** @param direction of the axis perpendicular to the circle plane */
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
}
const ParamsConfig = new CircleSopParamsConfig();

export class CircleSopNode extends TypedSopNode<CircleSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'circle';
	}

	initializeNode() {
		// this.io.inputs.setCount(0);
		// this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	private _operation: CircleSopOperation | undefined;
	cook() {
		this._operation = this._operation || new CircleSopOperation(this._scene, this.states);
		const core_group = this._operation.cook([], this.pv);
		this.setCoreGroup(core_group);
	}
}
