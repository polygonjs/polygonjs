import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {RBDAttribute, RBD_SHAPES, RBDShape} from '../../../core/physics/ammo/RBDBodyHelper';
import {Mesh} from 'three/src/objects/Mesh';
import {Vector3} from 'three/src/math/Vector3';
import {CoreObject} from '../../../core/geometry/Object';
import {TypeAssert} from '../../poly/Assert';

enum RBDAttributeMode {
	OBJECTS = 'objects',
	POINTS = 'points',
}
const RBD_ATTRIBUTE_MODES: Array<RBDAttributeMode> = [RBDAttributeMode.OBJECTS, RBDAttributeMode.POINTS];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PhysicsConstraintAttributesSopParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(RBD_ATTRIBUTE_MODES.indexOf(RBDAttributeMode.OBJECTS), {
		menu: {
			entries: RBD_ATTRIBUTE_MODES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	active = ParamConfig.BOOLEAN(1);
	shape = ParamConfig.INTEGER(RBD_SHAPES.indexOf(RBDShape.BOX), {
		menu: {
			entries: RBD_SHAPES.map((name, value) => {
				return {name: name, value: value};
			}),
		},
	});
	// shape_size_sphere = ParamConfig.FLOAT(1, {
	// 	visible_if: {shape: RBD_SHAPES.indexOf(RBDShape.SPHERE)},
	// });
	// shape_size_box = ParamConfig.VECTOR3([1, 1, 1], {
	// 	visible_if: {shape: RBD_SHAPES.indexOf(RBDShape.BOX)},
	// });
	add_id = ParamConfig.BOOLEAN(1);
	mass = ParamConfig.FLOAT(1);
	restitution = ParamConfig.FLOAT(0.5);
	damping = ParamConfig.FLOAT(0);
	angular_damping = ParamConfig.FLOAT(0);
	friction = ParamConfig.FLOAT(0.5);
	simulated = ParamConfig.FLOAT(1);
}
const ParamsConfig = new PhysicsConstraintAttributesSopParamsConfig();

export class PhysicsConstraintAttributesSopNode extends TypedSopNode<PhysicsConstraintAttributesSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'physics_constraint_attributes';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		if (RBD_ATTRIBUTE_MODES[this.pv.mode] == RBDAttributeMode.OBJECTS) {
			this._add_object_attributes(input_contents[0]);
		} else {
			this._add_point_attributes(input_contents[0]);
		}
		this.set_core_group(input_contents[0]);
	}

	private _add_object_attributes(core_group: CoreGroup) {
		const core_objects = core_group.core_objects();
		let core_object: CoreObject;
		for (let i = 0; i < core_objects.length; i++) {
			core_object = core_objects[i];
			core_object.set_attrib_value(RBDAttribute.ACTIVE, this.pv.active ? 1 : 0);
			core_object.set_attrib_value(RBDAttribute.MASS, this.pv.mass);
			core_object.set_attrib_value(RBDAttribute.RESTITUTION, this.pv.restitution);
			core_object.set_attrib_value(RBDAttribute.DAMPING, this.pv.damping);
			core_object.set_attrib_value(RBDAttribute.ANGULAR_DAMPING, this.pv.angular_damping);
			core_object.set_attrib_value(RBDAttribute.FRICTION, this.pv.friction);
			core_object.set_attrib_value(RBDAttribute.SIMULATED, this.pv.simulated);

			if (this.pv.add_id == true) {
				core_object.set_attrib_value(RBDAttribute.ID, `${this.full_path()}:${i}`);
			}

			// shape
			this._add_object_shape_specific_attributes(core_object);
		}
	}
	private _bbox_size = new Vector3();
	private _add_object_shape_specific_attributes(core_object: CoreObject) {
		core_object.set_attrib_value(RBDAttribute.SHAPE, this.pv.shape);
		const shape = RBD_SHAPES[this.pv.shape];
		switch (shape) {
			case RBDShape.BOX: {
				const geometry = (core_object.object() as Mesh).geometry;
				geometry.computeBoundingBox();
				const bbox = geometry.boundingBox;
				if (bbox) {
					bbox.getSize(this._bbox_size);
					core_object.set_attrib_value(RBDAttribute.SHAPE_SIZE_BOX, this._bbox_size);
				}
				return;
			}
			case RBDShape.SPHERE: {
				const geometry = (core_object.object() as Mesh).geometry;
				geometry.computeBoundingSphere();
				const bounding_sphere = geometry.boundingSphere;
				if (bounding_sphere) {
					core_object.set_attrib_value(RBDAttribute.SHAPE_SIZE_SPHERE, bounding_sphere.radius * 2);
				}
				return;
			}
		}
		TypeAssert.unreachable(shape);
	}
	private _add_point_attributes(core_group: CoreGroup) {
		for (let core_point of core_group.points()) {
			core_point.set_attrib_value(RBDAttribute.ACTIVE, this.pv.active ? 1 : 0);
		}
	}
}
