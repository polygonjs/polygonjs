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
	create_point = ParamConfig.BOOLEAN(DEFAULT.create_point);
	/** @param define the number of points to create */
	points_count = ParamConfig.INTEGER(DEFAULT.points_count, {
		range: [1, 100],
		range_locked: [true, false],
		visible_if: {create_point: true},
	});
	/** @param the position of the created points */
	position = ParamConfig.VECTOR3(DEFAULT.position, {visible_if: {create_point: true}});
	// create_polygon = ParamConfig.BOOLEAN(0);
	/** @param if the node has points as input, it will create a line. This define if the line is closed or open. */
	open = ParamConfig.BOOLEAN(DEFAULT.open);
	/** @param check if the last point is connected */
	connect_to_last_point = ParamConfig.BOOLEAN(DEFAULT.connect_to_last_point);
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
		this._operation = this._operation || new AddSopOperation(this.scene, this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.set_core_group(core_group);
	}
}
