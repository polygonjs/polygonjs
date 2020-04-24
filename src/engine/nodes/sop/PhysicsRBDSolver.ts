// https://stackblitz.com/edit/ammojs-typed-falling-cubes?file=simulation.ts
import {TypedSopNode} from './_Base';
import lodash_isString from 'lodash/isString';
import {CoreGroup} from '../../../core/geometry/Group';
import {AmmoRBDBodyHelper, RBDAttribute} from '../../../core/physics/ammo/RBDBodyHelper';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {CoreObject} from '../../../core/geometry/Object';
import {CorePoint} from '../../../core/geometry/Point';
import {AmmoForceHelper} from '../../../core/physics/ammo/ForceHelper';
import Ammo from 'ammojs-typed';

const NULL_ID = '';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class AmmoSolverSopParamsConfig extends NodeParamsConfig {
	gravity = ParamConfig.VECTOR3([0, -9.81, 0]);
	max_substeps = ParamConfig.INTEGER(2, {
		range: [1, 10],
		range_locked: [true, false],
	});
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PhysicsRBDSolverSopNode.PARAM_CALLBACK_reset(node as PhysicsRBDSolverSopNode);
		},
	});
}
const ParamsConfig = new AmmoSolverSopParamsConfig();

export class PhysicsRBDSolverSopNode extends TypedSopNode<AmmoSolverSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'physics_rbd_solver';
	}
	private config: Ammo.btDefaultCollisionConfiguration | undefined;
	private dispatcher: Ammo.btCollisionDispatcher | undefined;
	private overlappingPairCache: Ammo.btDbvtBroadphase | undefined;
	private solver: Ammo.btSequentialImpulseConstraintSolver | undefined;
	private world: Ammo.btDiscreteDynamicsWorld | undefined;
	private bodies: Ammo.btRigidBody[] = [];
	// private boxShape: Ammo.btBoxShape | undefined;
	// private sphereShape: Ammo.btSphereShape | undefined;
	// private transform: Ammo.btTransform | undefined;
	private _gravity: Ammo.btVector3 | undefined;
	private _bodies_by_id: Map<string, Ammo.btRigidBody> = new Map();
	private _bodies_active_state_by_id: Map<string, boolean> = new Map();
	// helpers
	private _body_helper: AmmoRBDBodyHelper | undefined;
	private _force_helper: AmmoForceHelper | undefined;
	// inputs
	private _input_init: CoreObject[] | undefined;
	private _input_force_points: CorePoint[] | undefined;
	private _input_update: CoreObject[] | undefined;

	static displayed_input_names(): string[] {
		return ['RBDs', 'Forces', 'Updated RBD Attributes'];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 3);
		this.ui_data.set_width(100);

		// this have to clone for now, to allow for reposition the input core_objects
		// when re-initializing the sim. If we do not clone, the objects will be modified,
		// and therefore the reseting the transform of the RBDs will be based on moved objects, which is wrong. Oh so very wrong.
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.ALWAYS, InputCloneMode.NEVER, InputCloneMode.NEVER]);

		// physics
		this.add_graph_input(this.scene.time_controller.graph_node);
		Ammo(Ammo).then(() => {
			this.prepare();
		});
	}
	prepare() {
		this._body_helper = new AmmoRBDBodyHelper();
		this._force_helper = new AmmoForceHelper();
		this.config = new Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new Ammo.btCollisionDispatcher(this.config);
		this.overlappingPairCache = new Ammo.btDbvtBroadphase();
		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.world = new Ammo.btDiscreteDynamicsWorld(
			this.dispatcher,
			this.overlappingPairCache,
			this.solver,
			this.config
		);
		this.world.setGravity(new Ammo.btVector3(0, -10, 0));
		this._gravity = new Ammo.btVector3(0, 0, 0);
	}

	cook(input_contents: CoreGroup[]) {
		if (this.scene.frame == 1) {
			this.reset();
		}
		if (!this._input_init) {
			this._input_init = input_contents[0].core_objects();

			this.init();
			// this.createGroundShape();
		}
		if (this._input_init) {
			const force_core_group = input_contents[1];
			const update_core_group = input_contents[2];
			this._input_force_points = force_core_group ? force_core_group.points() : undefined;
			this._input_update = update_core_group ? update_core_group.core_objects() : undefined;
			this.simulate(0.05);
			this.set_objects(this._input_init.map((co) => co.object()));
		} else {
			this.set_objects([]);
		}
	}

	// protected createGroundShape() {
	// 	if (!this.world) {
	// 		return;
	// 	}
	// 	const shape = new Ammo.btBoxShape(new Ammo.btVector3(50, 1, 50));
	// 	const transform = new Ammo.btTransform();
	// 	transform.setIdentity();
	// 	transform.setOrigin(new Ammo.btVector3(0, -1, 0));

	// 	const localInertia = new Ammo.btVector3(0, 0, 0);
	// 	const myMotionState = new Ammo.btDefaultMotionState(transform);
	// 	// if the mass is more than 0, the ground will react awkwardly
	// 	const mass = 0;
	// 	shape.calculateLocalInertia(mass, localInertia);
	// 	const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
	// 	const body = new Ammo.btRigidBody(rbInfo);
	// 	body.setRestitution(1);
	// 	// console.log("mass", body.setM)

	// 	this.world.addRigidBody(body);
	// 	// this.bodies.push(body);
	// }
	private init() {
		if (!(this.world && this._gravity && this._input_init && this._body_helper)) {
			return;
		}
		this._gravity.setValue(this.pv.gravity.x, this.pv.gravity.y, this.pv.gravity.z);
		this.world.setGravity(this._gravity);

		for (let i = 0; i < this._input_init.length; i++) {
			const core_object = this._input_init[i];
			const id = this._body_helper.read_object_attribute(core_object, RBDAttribute.ID, NULL_ID);
			if (id == NULL_ID) {
				console.warn('no id for RBD');
			}

			const body = this._body_helper.create_body(core_object);
			this.world.addRigidBody(body);
			this._body_helper.finalize_body(body, core_object);

			this._bodies_by_id.set(id, body);
			this._bodies_active_state_by_id.set(id, this._body_helper.is_active(body));
			this.bodies.push(body);
		}
		this._transform_core_objects_from_bodies();
		this._create_constraints();
	}
	private _create_constraints() {
		const rbd0 = this._bodies_by_id.get('/geo1/physics_rbd_attributes1:0')!;
		const rbd1 = this._bodies_by_id.get('/geo1/physics_rbd_attributes1:1')!;
		var pivotA = new Ammo.btVector3(0, 0.5, 0);
		var pivotB = new Ammo.btVector3(0, -0.5, 0);
		var axis = new Ammo.btVector3(0, 1, 0);
		const hinge = new Ammo.btHingeConstraint(rbd0, rbd1, pivotA, pivotB, axis, axis, true);
		const disable_collision_between_linked_bodies = true;
		this.world?.addConstraint(hinge, disable_collision_between_linked_bodies);
	}

	private simulate(dt: number) {
		if (!(this._input_init && this._body_helper)) {
			return;
		}

		this.world?.stepSimulation(dt, this.pv.max_substeps);
		this._apply_custom_forces();
		this._apply_rbd_update();
		this._transform_core_objects_from_bodies();
	}
	private _apply_custom_forces() {
		if (!(this._input_force_points && this._force_helper)) {
			return;
		}
		for (let i = 0; i < this._input_force_points.length; i++) {
			this._force_helper.apply_force(this._input_force_points[i], this.bodies);
		}
	}

	// TODO: use a deleted attribute to remove RBDs?
	// TODO: keep track of newly added ids
	private _apply_rbd_update() {
		if (!(this._input_update && this._body_helper)) {
			return;
		}
		for (let core_object of this._input_update) {
			const id = core_object.attrib_value(RBDAttribute.ID);
			if (lodash_isString(id)) {
				const body = this._bodies_by_id.get(id);
				if (body) {
					this._update_active_state(id, body, core_object);
					this._update_kinematic_transform(body, core_object);
				}
			}
		}
	}
	private _update_active_state(id: string, body: Ammo.btRigidBody, core_object: CoreObject) {
		const current_state = this._bodies_active_state_by_id.get(id);
		const active_attr = core_object.attrib_value(RBDAttribute.ACTIVE);
		const new_state = active_attr == 1;
		if (current_state != new_state) {
			if (new_state == true) {
				this._body_helper?.make_active(body, this.world!);
			} else {
				this._body_helper?.make_kinematic(body);
			}
			this._bodies_active_state_by_id.set(id, new_state);
		}
	}

	protected _update_kinematic_transform(body: Ammo.btRigidBody, core_object: CoreObject) {
		if (this._body_helper && this._body_helper.is_kinematic(body)) {
			this._body_helper.transform_body_from_core_object(body, core_object);
		}
	}

	private _transform_core_objects_from_bodies() {
		if (!(this._input_init && this._body_helper)) {
			return;
		}
		for (let i = 0; i < this._input_init.length; i++) {
			this._body_helper.transform_core_object_from_body(this._input_init[i], this.bodies[i]);
		}
	}

	//
	//
	// PARAM CALLBACKS
	//
	//
	static PARAM_CALLBACK_reset(node: PhysicsRBDSolverSopNode) {
		node.reset();
	}
	private reset() {
		this._input_init = undefined;

		if (!this.world) {
			return;
		}
		for (let i = 0; i < this.bodies.length; i++) {
			this.world.removeRigidBody(this.bodies[i]);
		}
		this.bodies = [];
	}
}
