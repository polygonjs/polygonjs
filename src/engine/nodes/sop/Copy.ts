/**
 * Copies a geometry onto every point from the right input.
 *
 * @remarks
 * This is different than the instance SOP, as the operation here is more expensive, but allows for more flexibility.
 *
 *
 */

import lodash_compact from 'lodash/compact';
import {TypedSopNode} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {CoreString} from '../../../core/String';
import {CopyStamp} from './utils/CopyStamp';
import {Matrix4} from 'three/src/math/Matrix4';
import {CorePoint} from '../../../core/geometry/Point';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three/src/core/Object3D';
import {Vector3} from 'three/src/math/Vector3';
import {Quaternion} from 'three/src/math/Quaternion';
class CopySopParamsConfig extends NodeParamsConfig {
	/** @param copies count, used when the second input is not given */
	count = ParamConfig.INTEGER(1, {
		range: [1, 20],
		range_locked: [true, false],
	});
	/** @param transforms every input object each on a single input point */
	transform_only = ParamConfig.BOOLEAN(0);
	/** @param toggles on to copy attributes from the input points to the created objects. Note that the vertex attributes from the points become object attributes */
	copy_attributes = ParamConfig.BOOLEAN(0);
	/** @param names of attributes to copy */
	attributes_to_copy = ParamConfig.STRING('', {
		visible_if: {copy_attributes: true},
	});
	/** @param toggle on to use the `copy` expression, which allows to change how the left input is evaluated for each point */
	use_copy_expr = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new CopySopParamsConfig();

export class CopySopNode extends TypedSopNode<CopySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'copy';
	}

	private _attribute_names_to_copy: string[] = [];
	private _objects: Object3D[] = [];
	private _stamp_node!: CopyStamp;

	static displayed_input_names(): string[] {
		return ['geometry to be copied', 'points to copy to'];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.ALWAYS, InputCloneMode.NEVER]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group0 = input_contents[0];
		if (!this.io.inputs.has_input(1)) {
			await this.cook_without_template(core_group0);
			return;
		}

		const core_group1 = input_contents[1];
		if (!core_group1) {
			this.states.error.set('second input invalid');
			return;
		}
		await this.cook_with_template(core_group0, core_group1);
	}

	private async cook_with_template(instance_core_group: CoreGroup, template_core_group: CoreGroup) {
		this._objects = [];

		const template_points = template_core_group.points();

		const instancer = new CoreInstancer(template_core_group);
		let instance_matrices = instancer.matrices();
		const t = new Vector3();
		const q = new Quaternion();
		const s = new Vector3();
		instance_matrices[0].decompose(t, q, s);

		this._attribute_names_to_copy = CoreString.attrib_names(this.pv.attributes_to_copy).filter((attrib_name) =>
			template_core_group.has_attrib(attrib_name)
		);
		await this._copy_moved_objects_on_template_points(instance_core_group, instance_matrices, template_points);
		this.set_objects(this._objects);
	}

	// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
	private async _copy_moved_objects_on_template_points(
		instance_core_group: CoreGroup,
		instance_matrices: Matrix4[],
		template_points: CorePoint[]
	) {
		for (let point_index = 0; point_index < template_points.length; point_index++) {
			await this._copy_moved_object_on_template_point(
				instance_core_group,
				instance_matrices,
				template_points,
				point_index
			);
		}
	}

	private async _copy_moved_object_on_template_point(
		instance_core_group: CoreGroup,
		instance_matrices: Matrix4[],
		template_points: CorePoint[],
		point_index: number
	) {
		const matrix = instance_matrices[point_index];
		const template_point = template_points[point_index];
		this.stamp_node.set_point(template_point);

		const moved_objects = await this._get_moved_objects_for_template_point(instance_core_group, point_index);

		for (let moved_object of moved_objects) {
			if (this.pv.copy_attributes) {
				this._copy_attributes_from_template(moved_object, template_point);
			}

			// TODO: that node is getting inconsistent...
			// should I always only move the object?
			// and have a toggle to bake back to the geo?
			// or just enfore the use of a merge?
			if (this.pv.transform_only) {
				moved_object.applyMatrix4(matrix);
			} else {
				const geometry = moved_object.geometry;
				if (geometry) {
					moved_object.geometry.applyMatrix4(matrix);
				} //else {
				//moved_object.applyMatrix4(matrix);
				//}
			}

			this._objects.push(moved_object);
		}
	}

	private async _get_moved_objects_for_template_point(
		instance_core_group: CoreGroup,
		point_index: number
	): Promise<Object3DWithGeometry[]> {
		const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
		if (stamped_instance_core_group) {
			// duplicate or select from instance children
			const moved_objects = this.pv.transform_only
				? // TODO: why is doing a transform slower than cloning the input??
				  lodash_compact([stamped_instance_core_group.objects_with_geo()[point_index]])
				: stamped_instance_core_group.clone().objects_with_geo();

			return moved_objects;
		} else {
			return [];
		}
	}

	private async _stamp_instance_group_if_required(instance_core_group: CoreGroup): Promise<CoreGroup | undefined> {
		if (this.pv.use_copy_expr) {
			const container0 = await this.container_controller.request_input_container(0);
			if (container0) {
				const core_group0 = container0.core_content();
				if (core_group0) {
					return core_group0;
				} else {
					return;
				}
			} else {
				this.states.error.set(`input failed for index ${this.stamp_value()}`);
				return;
			}
		} else {
			return instance_core_group;
		}
	}

	private async _copy_moved_objects_for_each_instance(instance_core_group: CoreGroup) {
		for (let i = 0; i < this.pv.count; i++) {
			await this._copy_moved_objects_for_instance(instance_core_group, i);
		}
	}

	private async _copy_moved_objects_for_instance(instance_core_group: CoreGroup, i: number) {
		this.stamp_node.set_global_index(i);

		const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
		if (stamped_instance_core_group) {
			stamped_instance_core_group.objects().forEach((object) => {
				// TODO: I should use the Core Group, to ensure that material.linewidth is properly cloned
				const new_object = CoreObject.clone(object);
				this._objects.push(new_object);
			});
		}
	}

	// TODO: what if I combine both param_count and stamping?!
	private async cook_without_template(instance_core_group: CoreGroup) {
		this._objects = [];
		await this._copy_moved_objects_for_each_instance(instance_core_group);

		this.set_objects(this._objects);
	}

	private _copy_attributes_from_template(object: Object3D, template_point: CorePoint) {
		this._attribute_names_to_copy.forEach((attrib_name, i) => {
			const attrib_value = template_point.attrib_value(attrib_name);
			const object_wrapper = new CoreObject(object, i);
			object_wrapper.add_attribute(attrib_name, attrib_value);
		});
	}

	//
	//
	// STAMP
	//
	//
	stamp_value(attrib_name?: string) {
		return this.stamp_node.value(attrib_name);
	}
	get stamp_node() {
		return (this._stamp_node = this._stamp_node || this.create_stamp_node());
	}
	private create_stamp_node() {
		const stamp_node = new CopyStamp(this.scene);
		this.dirty_controller.set_forbidden_trigger_nodes([stamp_node]);
		return stamp_node;
	}

	// private set_dirty_allowed(original_trigger_graph_node: CoreGraphNode): boolean {
	// 	return original_trigger_graph_node.graph_node_id !== this.stamp_node.graph_node_id;
	// }
}
