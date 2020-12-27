/**
 * Transfers an attribute from right input to left input
 *
 * @remarks
 * This can be useful to create heatmap.
 *
 */
import {TypedSopNode} from './_Base';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreInterpolate} from '../../../core/math/Interpolate';
import {CoreOctree} from '../../../core/math/octree/Octree';
import {CoreIterator} from '../../../core/Iterator';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
class AttribTransferSopParamsConfig extends NodeParamsConfig {
	/** @param source group to transfer from (right input, or input 1) */
	src_group = ParamConfig.STRING();
	/** @param dest group to transfer to (left input, or input 0) */
	dest_group = ParamConfig.STRING();
	/** @param name of the attribute to transfer */
	name = ParamConfig.STRING();
	/** @param max number of samples to use */
	max_samples_count = ParamConfig.INTEGER(1, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param max distance to search points to transfer from */
	distance_threshold = ParamConfig.FLOAT(1);
	/** @param blend width */
	blend_width = ParamConfig.FLOAT(0);
}
const ParamsConfig = new AttribTransferSopParamsConfig();

export class AttribTransferSopNode extends TypedSopNode<AttribTransferSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'attribTransfer';
	}

	_core_group_dest!: CoreGroup;
	_core_group_src!: CoreGroup;

	// utils
	_attrib_names!: string[];
	_octree_timestamp: number | undefined;
	_prev_param_src_group: string | undefined;
	_octree: CoreOctree | undefined;

	static displayed_input_names(): string[] {
		return ['geometry to transfer attributes to', 'geometry to transfer attributes from'];
	}

	initialize_node() {
		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	async cook(input_contents: CoreGroup[]) {
		this._core_group_dest = input_contents[0];
		const dest_points = this._core_group_dest.points_from_group(this.pv.dest_group);

		this._core_group_src = input_contents[1];

		this._attrib_names = this._core_group_src.attrib_names_matching_mask(this.pv.name);
		this._error_if_attribute_not_found_on_second_input();
		this._build_octree_if_required(this._core_group_src);
		this._add_attribute_if_required();

		await this._transfer_attributes(dest_points);
		this.set_core_group(this._core_group_dest);
	}

	_error_if_attribute_not_found_on_second_input() {
		for (let attrib_name of this._attrib_names) {
			if (!this._core_group_src.has_attrib(attrib_name)) {
				this.states.error.set(`attribute '${attrib_name}' not found on second input`);
			}
		}
	}

	private _build_octree_if_required(core_group: CoreGroup) {
		const second_input_changed =
			this._octree_timestamp == null || this._octree_timestamp !== core_group.timestamp();
		const src_group_changed = this._prev_param_src_group !== this.pv.src_group;

		if (src_group_changed || second_input_changed) {
			this._octree_timestamp = core_group.timestamp();
			this._prev_param_src_group = this.pv.src_group;

			const points_src = this._core_group_src.points_from_group(this.pv.src_group);

			this._octree = new CoreOctree(this._core_group_src.bounding_box());
			this._octree.set_points(points_src);
		}
	}

	private _add_attribute_if_required() {
		this._attrib_names.forEach((attrib_name) => {
			if (!this._core_group_dest.has_attrib(attrib_name)) {
				const attrib_size = this._core_group_src.attrib_size(attrib_name);
				this._core_group_dest.add_numeric_vertex_attrib(attrib_name, attrib_size, 0);
			}
		});
	}

	private async _transfer_attributes(dest_points: CorePoint[]) {
		const iterator = new CoreIterator();
		await iterator.start_with_array(dest_points, this._transfer_attributes_for_point.bind(this));
	}
	private _transfer_attributes_for_point(dest_point: CorePoint) {
		const total_dist = this.pv.distance_threshold + this.pv.blend_width;
		const nearest_points: CorePoint[] =
			this._octree?.find_points(dest_point.position(), total_dist, this.pv.max_samples_count) || [];

		for (let attrib_name of this._attrib_names) {
			this._interpolate_points(dest_point, nearest_points, attrib_name);
		}
	}

	private _interpolate_points(point_dest: CorePoint, src_points: CorePoint[], attrib_name: string) {
		let new_value: number;

		new_value = CoreInterpolate.perform(
			point_dest,
			src_points,
			attrib_name,
			this.pv.distance_threshold,
			this.pv.blend_width
		);

		if (new_value != null) {
			point_dest.set_attrib_value(attrib_name, new_value);
		}
	}
}
