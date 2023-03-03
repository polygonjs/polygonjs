/**
 * Creates a circle.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {CircleSopOperation} from '../../operations/sop/Circle';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {SopType} from '../../poly/registers/nodes/types/Sop';
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
	/** @param connects last dot for open circle */
	connectLastPoint = ParamConfig.BOOLEAN(DEFAULT.connectLastPoint, {
		visibleIf: {open: 1},
	});
	/** @param angle fo the arc */
	arcAngle = ParamConfig.FLOAT(DEFAULT.arcAngle, {
		range: [0, 360],
		rangeLocked: [false, false],
		visibleIf: {open: 1},
	});
	/** @param direction of the axis perpendicular to the circle plane */
	direction = ParamConfig.VECTOR3(DEFAULT.direction);
	/** @param center */
	center = ParamConfig.VECTOR3(DEFAULT.center);
}
const ParamsConfig = new CircleSopParamsConfig();

export class CircleSopNode extends TypedSopNode<CircleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CIRCLE;
	}

	private _operation: CircleSopOperation | undefined;
	override cook() {
		this._operation = this._operation || new CircleSopOperation(this._scene, this.states, this);
		const coreGroup = this._operation.cook([], this.pv);
		this.setCoreGroup(coreGroup);
	}
}
