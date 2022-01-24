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
	srcGroup = ParamConfig.STRING();
	/** @param dest group to transfer to (left input, or input 0) */
	destGroup = ParamConfig.STRING();
	/** @param name of the attribute to transfer */
	name = ParamConfig.STRING();
	/** @param max number of samples to use */
	maxSamplesCount = ParamConfig.INTEGER(1, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param max distance to search points to transfer from */
	distanceThreshold = ParamConfig.FLOAT(1);
	/** @param blend width */
	blendWidth = ParamConfig.FLOAT(0);
}
const ParamsConfig = new AttribTransferSopParamsConfig();

export class AttribTransferSopNode extends TypedSopNode<AttribTransferSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribTransfer';
	}

	_core_group_dest!: CoreGroup;
	_core_group_src!: CoreGroup;

	// utils
	_attrib_names!: string[];
	_octree_timestamp: number | undefined;
	_prev_param_srcGroup: string | undefined;
	_octree: CoreOctree | undefined;

	static override displayedInputNames(): string[] {
		return ['geometry to transfer attributes to', 'geometry to transfer attributes from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override async cook(input_contents: CoreGroup[]) {
		this._core_group_dest = input_contents[0];
		const dest_points = this._core_group_dest.pointsFromGroup(this.pv.destGroup);

		this._core_group_src = input_contents[1];

		this._attrib_names = this._core_group_src.attribNamesMatchingMask(this.pv.name);
		this._error_if_attribute_not_found_on_second_input();
		this._build_octree_if_required(this._core_group_src);
		this._add_attribute_if_required();

		await this._transfer_attributes(dest_points);
		this.setCoreGroup(this._core_group_dest);
	}

	_error_if_attribute_not_found_on_second_input() {
		for (let attrib_name of this._attrib_names) {
			if (!this._core_group_src.hasAttrib(attrib_name)) {
				this.states.error.set(`attribute '${attrib_name}' not found on second input`);
			}
		}
	}

	private _build_octree_if_required(core_group: CoreGroup) {
		const second_input_changed =
			this._octree_timestamp == null || this._octree_timestamp !== core_group.timestamp();
		const srcGroup_changed = this._prev_param_srcGroup !== this.pv.srcGroup;

		if (srcGroup_changed || second_input_changed) {
			this._octree_timestamp = core_group.timestamp();
			this._prev_param_srcGroup = this.pv.srcGroup;

			const points_src = this._core_group_src.pointsFromGroup(this.pv.srcGroup);

			this._octree = new CoreOctree(this._core_group_src.boundingBox());
			this._octree.set_points(points_src);
		}
	}

	private _add_attribute_if_required() {
		for (let attrib_name of this._attrib_names) {
			if (!this._core_group_dest.hasAttrib(attrib_name)) {
				const attrib_size = this._core_group_src.attribSize(attrib_name);
				this._core_group_dest.addNumericVertexAttrib(attrib_name, attrib_size, 0);
			}
		}
	}

	private async _transfer_attributes(dest_points: CorePoint[]) {
		const iterator = new CoreIterator();
		await iterator.startWithArray(dest_points, this._transfer_attributes_for_point.bind(this));
	}
	private _transfer_attributes_for_point(dest_point: CorePoint) {
		const total_dist = this.pv.distanceThreshold + this.pv.blendWidth;
		const nearest_points: CorePoint[] =
			this._octree?.find_points(dest_point.position(), total_dist, this.pv.maxSamplesCount) || [];

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
			this.pv.distanceThreshold,
			this.pv.blendWidth
		);

		if (new_value != null) {
			point_dest.setAttribValue(attrib_name, new_value);
		}
	}
}
