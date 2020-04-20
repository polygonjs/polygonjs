import lodash_compact from 'lodash/compact';
import {TypedSopNode} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {CoreObject} from '../../../core/geometry/Object';
// import {CoreGeometry} from '../../../core/geometry/Geometry'
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {CoreString} from '../../../core/String';
// import {NodeSimple} from '../../../Core/Graph/NodeSimple'
import {CopyStamp} from './utils/CopyStamp';
import {Matrix4} from 'three/src/math/Matrix4';
import {CorePoint} from '../../../core/geometry/Point';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three/src/core/Object3D';
class CopySopParamsConfig extends NodeParamsConfig {
	count = ParamConfig.INTEGER(1, {
		range: [1, 20],
		range_locked: [true, false],
	});
	transform_only = ParamConfig.BOOLEAN(0);
	copy_attributes = ParamConfig.BOOLEAN(0);
	attributes_to_copy = ParamConfig.STRING('', {
		visible_if: {copy_attributes: true},
	});
	use_copy_expr = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new CopySopParamsConfig();

export class CopySopNode extends TypedSopNode<CopySopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'copy';
	}

	private _attribute_names_to_copy: string[] = [];
	// private _group: Group|undefined;
	private _objects: Object3D[] = [];
	private _stamp_node!: CopyStamp;

	static displayed_input_names(): string[] {
		return ['geometry to be copied', 'points to copy to'];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 2);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.ALWAYS, InputCloneMode.NEVER]);
	}

	// async evaluate_inputs_and_params() {
	// 	await this.eval_all_params()
	// }

	async cook() {
		let core_group0;
		const container0 = await this.container_controller.request_input_container(0);
		if (container0 != null && (core_group0 = container0.core_content()) != null) {
			if (this.io.inputs.has_input(1)) {
				let core_group1;
				const container1 = await this.container_controller.request_input_container(1);
				if (container1 != null && (core_group1 = container1.core_content()) != null) {
					await this.cook_with_template(core_group0, core_group1);
				} else {
					this.states.error.set('second input required');
				}
			} else {
				this.cook_without_template(core_group0);
			}
		} else {
			this.states.error.set('first input required');
		}
	}

	private async cook_with_template(instance_core_group: CoreGroup, template_core_group: CoreGroup) {
		this._objects = [];

		const template_points = template_core_group.points();

		const instancer = new CoreInstancer(template_core_group);
		let instance_matrices = instancer.matrices();

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
		// template_points.forEach((template_point, point_index) => {
		// 	p = p.then(() => {
		// 		return this._copy_moved_object_on_template_point(
		// 			instance_core_group,
		// 			instance_matrices,
		// 			template_points,
		// 			point_index
		// 		);
		// 	});
		// });
	}

	private _copy_moved_object_on_template_point(
		instance_core_group: CoreGroup,
		instance_matrices: Matrix4[],
		template_points: CorePoint[],
		point_index: number
	) {
		return new Promise(async (resolve, reject) => {
			const matrix = instance_matrices[point_index];
			const template_point = template_points[point_index];
			this.stamp_node.set_point(template_point);

			const moved_objects = await this._get_moved_objects_for_template_point(instance_core_group, point_index);

			moved_objects.forEach((moved_object) => {
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

				return this._objects.push(moved_object);
			});

			return resolve();
		});
	}

	private _get_moved_objects_for_template_point(
		instance_core_group: CoreGroup,
		point_index: number
	): Promise<Object3DWithGeometry[]> {
		return new Promise(async (resolve, reject) => {
			const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
			if (stamped_instance_core_group) {
				// duplicate or select from instance children
				const moved_objects = this.pv.transform_only
					? // TODO: why is doing a transform slower than cloning the input??
					  lodash_compact([instance_core_group.objects()[point_index]])
					: instance_core_group.clone().objects();

				resolve(moved_objects);
			} else {
				resolve([]);
			}
		});
	}

	private _stamp_instance_group_if_required(instance_core_group: CoreGroup): Promise<CoreGroup | undefined> {
		return new Promise(async (resolve, reject) => {
			if (this.pv.use_copy_expr) {
				const container0 = await this.container_controller.request_input_container(0);
				let core_group0: CoreGroup;
				if (container0 && (core_group0 = container0.core_content()) != null) {
					// this.stamp_node.increment_global_value()
					resolve(core_group0);
				} else {
					this.states.error.set(`input failed for index ${this.stamp_value()}`);
					resolve();
				}
			} else {
				resolve(instance_core_group);
			}
		});
	}

	// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
	private async _copy_moved_objects_for_each_instance(instance_core_group: CoreGroup) {
		// let p = Promise.resolve(); // Q() in q

		for (let i = 0; i < this.pv.count; i++) {
			await this._copy_moved_objects_for_instance(instance_core_group, i);
		}
		// lodash_times(this.pv.count, (i) => {
		// 	p = p.then(() => {
		// 		return this._copy_moved_objects_for_instance(instance_core_group, i);
		// 	});
		// });

		// return p;
	}

	private _copy_moved_objects_for_instance(instance_core_group: CoreGroup, i: number) {
		return new Promise(async (resolve, reject) => {
			this.stamp_node.set_global_index(i);

			const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
			if (stamped_instance_core_group) {
				stamped_instance_core_group.objects().forEach((object) => {
					// TODO: I should use the Group wrapper, to ensure that material.linewidth is properly cloned
					const new_object = CoreObject.clone(object);
					this._objects.push(new_object);
				});
			}

			resolve();
		});
	}

	// TODO: what if I combine both @_param_count and stamping?!
	private cook_without_template(instance_core_group: CoreGroup) {
		this._objects = [];
		this._copy_moved_objects_for_each_instance(instance_core_group).then(() => {
			this.set_objects(this._objects);
		});
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
