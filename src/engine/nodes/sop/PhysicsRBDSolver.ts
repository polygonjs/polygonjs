// https://stackblitz.com/edit/ammojs-typed-falling-cubes?file=simulation.ts
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import Ammo from 'ammojs-typed';
import {AmmoRBDBodyHelper} from '../../../core/physics/ammo/RBDBodyHelper';
import {CollisionFlag, BodyState} from '../../../core/physics/ammo/Constant';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
import {CoreObject} from '../../../core/geometry/Object';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CorePoint} from '../../../core/geometry/Point';
import {AmmoForceHelper} from '../../../core/physics/ammo/ForceHelper';
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
	private _body_helper: AmmoRBDBodyHelper | undefined;
	private _force_helper: AmmoForceHelper | undefined;
	private _input_objects: CoreObject[] | undefined;
	private _input_force_points: CorePoint[] | undefined;

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
		// const graph_node = new CoreGraphNode(this.scene, 'time');
		this.add_graph_input(this.scene.time_controller.graph_node);
		// graph_node.add_post_dirty_hook('ammo_solver', () => {
		// 	this.cook_controller.cook_main_without_inputs();
		// });
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
		// const box_size = 0.5;
		// this.boxShape = new Ammo.btBoxShape(new Ammo.btVector3(box_size, box_size, box_size));
		// this.sphereShape = new Ammo.btSphereShape(box_size);
		// this.transform = new Ammo.btTransform();
		this._gravity = new Ammo.btVector3(0, 0, 0);
	}

	cook(input_contents: CoreGroup[]) {
		if (this.scene.frame == 1) {
			this.reset();
		}
		if (!this._input_objects) {
			this._input_objects = input_contents[0].core_objects();

			this.init();
			// this.createGroundShape();
		}
		if (this._input_objects) {
			const force_core_group = input_contents[1];
			this._input_force_points = force_core_group ? force_core_group.points() : undefined;
			this.simulate(0.05);
			this.set_objects(this._input_objects.map((co) => co.object()));
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
		if (!(this.world && this._gravity && this._input_objects && this._body_helper)) {
			return;
		}
		this._gravity.setValue(this.pv.gravity.x, this.pv.gravity.y, this.pv.gravity.z);
		this.world.setGravity(this._gravity);

		for (let i = 0; i < this._input_objects.length; i++) {
			const body = this._body_helper.create_body(this._input_objects[i]);

			this.world.addRigidBody(body);
			this.bodies.push(body);
		}
		this._transform_core_objects_from_bodies();
	}
	protected resetPositions() {
		for (let i = 0; i < this.bodies.length; i++) {
			const body = this.bodies[i];
			if (i == 12) {
				body.setCollisionFlags(CollisionFlag.KINEMATIC_OBJECT);
				body.setActivationState(BodyState.DISABLE_DEACTIVATION);

				// const rbd_transform = body.getWorldTransform();
				const rbd_transform = new Ammo.btTransform();
				body.getMotionState().getWorldTransform(rbd_transform);
				const origin = rbd_transform.getOrigin();
				origin.setX(2 * i);
				origin.setY(3 * (i + 1));
				// origin.setZ(2.2 * (0.5 - Math.random()));
				const rot = (Math.PI * i) / 4;
				const rotation = rbd_transform.getRotation();
				rotation.setX(rot);
				rotation.setY(rot);
				rotation.setZ(rot);
				// rotation.setY(360 * Math.random());
				// rotation.setZ(360 * Math.random());
				// rotation.setW(360 * Math.random());
				rotation.normalize();
				rbd_transform.setRotation(rotation);
				body.setRestitution(0.8);
				body.setDamping(0, 0.5);
				body.getMotionState().setWorldTransform(rbd_transform);
				// body.setLinearVelocity(new Ammo.btVector3(0, 5, 0));
				// body.applyForce(new Ammo.btVector3(0, 0, 1), new Ammo.btVector3(0, 50, 0));
				// body.applyImpulse()
				// body.applyCentralImpulse(new Ammo.btVector3(0, 0, 50));
				// body.applyCentralLocalForce(new Ammo.btVector3(0, 0, 50)); // seems local to itself
			} else {
				// const rbd_transform = body.getWorldTransform();
				// // const rbd_transform = new Ammo.btTransform();
				// // body.getMotionState().getWorldTransform(rbd_transform);
				// const origin = rbd_transform.getOrigin();
				// origin.setX(2 * i);
				// origin.setY(3 * (i + 1));
				// // origin.setZ(2.2 * (0.5 - Math.random()));
				// const rot = (Math.PI * i) / 4;
				// const rotation = rbd_transform.getRotation();
				// rotation.setX(rot);
				// rotation.setY(rot);
				// rotation.setZ(rot);
				// // rotation.setY(360 * Math.random());
				// // rotation.setZ(360 * Math.random());
				// // rotation.setW(360 * Math.random());
				// rotation.normalize();
				// rbd_transform.setRotation(rotation);
				// body.setRestitution(0.8);
				// body.setDamping(0, 0.5);
				// body.getMotionState().setWorldTransform(rbd_transform);
				// body.setLinearVelocity(new Ammo.btVector3(0, 5, 0));
				// body.applyForce(new Ammo.btVector3(0, 0, 1), new Ammo.btVector3(0, 50, 0));
				// body.applyImpulse()
				// body.applyCentralImpulse(new Ammo.btVector3(0, 0, 50));
				// body.applyCentralLocalForce(new Ammo.btVector3(0, 0, 50)); // seems local to itself
			}
		}
	}
	private simulate(dt: number) {
		if (!(this._input_objects && this._body_helper)) {
			return;
		}

		this.world?.stepSimulation(dt, this.pv.max_substeps);
		this._apply_custom_forces();
		// this._move_kinematics();
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

	protected _move_kinematics() {
		let body: Ammo.btRigidBody;
		for (let i = 0; i < this.bodies.length; i++) {
			if (i == 3) {
				console.log(i);
				body = this.bodies[i];
				const rbd_transform = new Ammo.btTransform();
				body.getMotionState().getWorldTransform(rbd_transform);
				const origin = rbd_transform.getOrigin();
				const new_x = origin.x() - 0.1;
				const new_y = 0 + Math.abs(Math.sin(this.scene.time * 10));
				console.log(new_x, new_y);
				origin.setX(new_x);
				origin.setY(new_y);
				body.getMotionState().setWorldTransform(rbd_transform);
			}
		}
	}

	private _transform_core_objects_from_bodies() {
		if (!(this._input_objects && this._body_helper)) {
			return;
		}
		for (let i = 0; i < this._input_objects.length; i++) {
			this._body_helper.transform_core_object_from_body(this._input_objects[i], this.bodies[i]);
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
		this._input_objects = undefined;

		if (!this.world) {
			return;
		}
		for (let i = 0; i < this.bodies.length; i++) {
			this.world.removeRigidBody(this.bodies[i]);
		}
		this.bodies = [];
	}
}
