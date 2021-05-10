/**
 * Copies a geometry onto every point from the right input.
 *
 * @remarks
 * This is different than the instance SOP, as the operation here is more expensive, but allows for more flexibility.
 *
 *
 */

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
import {ArrayUtils} from '../../../core/ArrayUtils';
import {TypeAssert} from '../../poly/Assert';
import {isBooleanTrue} from '../../../core/BooleanValue';

enum TransformMode {
	OBJECT = 0,
	GEOMETRY = 1,
}
const TRANSFORM_MODES: TransformMode[] = [TransformMode.OBJECT, TransformMode.GEOMETRY];
const TransformModeMenuEntries = [
	{name: 'object', value: TransformMode.OBJECT},
	{name: 'geometry', value: TransformMode.GEOMETRY},
];
class CopySopParamsConfig extends NodeParamsConfig {
	/** @param copies count, used when the second input is not given */
	count = ParamConfig.INTEGER(1, {
		range: [1, 20],
		rangeLocked: [true, false],
	});
	/** @param transforms every input object each on a single input point */
	transformOnly = ParamConfig.BOOLEAN(0);
	/** @param defines if the objects or the geometries are transformed */
	transformMode = ParamConfig.INTEGER(0, {
		menu: {
			entries: TransformModeMenuEntries,
		},
	});
	/** @param toggles on to copy attributes from the input points to the created objects. Note that the vertex attributes from the points become object attributes */
	copyAttributes = ParamConfig.BOOLEAN(0);
	/** @param names of attributes to copy */
	attributesToCopy = ParamConfig.STRING('', {
		visibleIf: {copyAttributes: true},
	});
	/** @param toggle on to use the `copy` expression, which allows to change how the left input is evaluated for each point */
	useCopyExpr = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new CopySopParamsConfig();

export class CopySopNode extends TypedSopNode<CopySopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'copy';
	}

	private _attribute_names_to_copy: string[] = [];
	private _objects: Object3D[] = [];
	private _stamp_node!: CopyStamp;

	static displayedInputNames(): string[] {
		return ['geometry to be copied', 'points to copy to'];
	}

	initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState([InputCloneMode.ALWAYS, InputCloneMode.NEVER]);
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

		this._attribute_names_to_copy = CoreString.attribNames(this.pv.attributesToCopy).filter((attrib_name) =>
			template_core_group.hasAttrib(attrib_name)
		);
		await this._copy_moved_objects_on_template_points(instance_core_group, instance_matrices, template_points);
		this.setObjects(this._objects);
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
			if (isBooleanTrue(this.pv.copyAttributes)) {
				this._copyAttributes_from_template(moved_object, template_point);
			}

			// TODO: that node is getting inconsistent...
			// should I always only move the object?
			// and have a toggle to bake back to the geo?
			// or just enfore the use of a merge?
			if (isBooleanTrue(this.pv.transformOnly)) {
				moved_object.applyMatrix4(matrix);
			} else {
				this._apply_matrix_to_object_or_geometry(moved_object, matrix);
			}

			this._objects.push(moved_object);
		}
	}

	private _apply_matrix_to_object_or_geometry(object: Object3D, matrix: Matrix4) {
		const transformMode = TRANSFORM_MODES[this.pv.transformMode];
		switch (transformMode) {
			case TransformMode.OBJECT: {
				this._apply_matrix_to_object(object, matrix);
				return;
			}
			case TransformMode.GEOMETRY: {
				const geometry = (object as Object3DWithGeometry).geometry;
				if (geometry) {
					geometry.applyMatrix4(matrix);
				}
				return;
			}
		}
		TypeAssert.unreachable(transformMode);
	}

	private _object_position = new Vector3();
	private _apply_matrix_to_object(object: Object3D, matrix: Matrix4) {
		// center to origin
		this._object_position.copy(object.position);
		object.position.multiplyScalar(0);
		object.updateMatrix();
		// apply matrix
		object.applyMatrix4(matrix);
		// revert to position
		object.position.add(this._object_position);
		object.updateMatrix();
	}

	private async _get_moved_objects_for_template_point(
		instance_core_group: CoreGroup,
		point_index: number
	): Promise<Object3D[]> {
		const stamped_instance_core_group = await this._stamp_instance_group_if_required(instance_core_group);
		if (stamped_instance_core_group) {
			// duplicate or select from instance children
			const moved_objects = isBooleanTrue(this.pv.transformOnly)
				? // TODO: why is doing a transform slower than cloning the input??
				  ArrayUtils.compact([stamped_instance_core_group.objects()[point_index]])
				: stamped_instance_core_group.clone().objects();

			return moved_objects;
		} else {
			return [];
		}
	}

	private async _stamp_instance_group_if_required(instance_core_group: CoreGroup): Promise<CoreGroup | undefined> {
		if (isBooleanTrue(this.pv.useCopyExpr)) {
			const container0 = await this.containerController.requestInputContainer(0);
			if (container0) {
				const core_group0 = container0.coreContent();
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

		this.setObjects(this._objects);
	}

	private _copyAttributes_from_template(object: Object3D, template_point: CorePoint) {
		this._attribute_names_to_copy.forEach((attrib_name, i) => {
			const attrib_value = template_point.attribValue(attrib_name);
			const object_wrapper = new CoreObject(object, i);
			object_wrapper.addAttribute(attrib_name, attrib_value);
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
		const stamp_node = new CopyStamp(this.scene());
		this.dirtyController.setForbiddenTriggerNodes([stamp_node]);
		return stamp_node;
	}
	dispose() {
		super.dispose();
		if (this._stamp_node) {
			this._stamp_node.dispose();
		}
	}

	// private set_dirty_allowed(original_trigger_graph_node: CoreGraphNode): boolean {
	// 	return original_trigger_graph_node.graphNodeId() !== this.stamp_node.graphNodeId();
	// }
}
