/**
 * Adds points or creates lines.
 *
 * @remarks
 * The add node can be used to add a single or multiple points.
 * If given points as input, it can also connect those points with a line.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {AddSopOperation} from '../../../core/operations/sop/Add';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
const DEFAULT = AddSopOperation.DEFAULT_PARAMS;
class AddSopParamsConfig extends NodeParamsConfig {
	/** @param toggle to create points */
	createPoint = ParamConfig.BOOLEAN(DEFAULT.createPoint);
	/** @param define the number of points to create */
	pointsCount = ParamConfig.INTEGER(DEFAULT.pointsCount, {
		range: [1, 100],
		rangeLocked: [true, false],
		visibleIf: {createPoint: true},
	});
	/** @param the position of the created points */
	position = ParamConfig.VECTOR3(DEFAULT.position, {visibleIf: {createPoint: true}});
	/** @param toggle on to connect the points from the input geometry */
	connectInputPoints = ParamConfig.BOOLEAN(DEFAULT.connectInputPoints);
	/** @param check if the last point is connected */
	connectToLastPoint = ParamConfig.BOOLEAN(DEFAULT.connectToLastPoint);
}
const ParamsConfig = new AddSopParamsConfig();

export class AddSopNode extends TypedSopNode<AddSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'add';
	}

	static displayed_input_names(): string[] {
		return ['geometry to create polygons from (optional)'];
	}

	initialize_node() {
		this.io.inputs.set_count(0, 1);
	}

	private _operation: AddSopOperation | undefined;
	cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AddSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}
}
