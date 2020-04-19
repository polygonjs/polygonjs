// https://stackblitz.com/edit/ammojs-typed-falling-cubes?file=simulation.ts
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Matrix4} from 'three/src/math/Matrix4';
import {Quaternion} from 'three/src/math/Quaternion';
import {Object3D} from 'three/src/core/Object3D';
// import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import Ammo from 'ammojs-typed';

export enum CollisionFlag {
	STATIC_OBJECT = 1,
	KINEMATIC_OBJECT = 2,
	NO_CONTACT_RESPONSE = 4,
}

export enum BodyState {
	ACTIVE_TAG = 1,
	ISLAND_SLEEPING = 2,
	WANTS_DEACTIVATION = 3,
	DISABLE_DEACTIVATION = 4,
	DISABLE_SIMULATION = 5,
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseNodeType} from '../_Base';
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
	private boxShape: Ammo.btBoxShape | undefined;
	private sphereShape: Ammo.btSphereShape | undefined;
	private transform: Ammo.btTransform | undefined;
	private _gravity: Ammo.btVector3 | undefined;
	// private numBoxes = 2;

	initialize_node() {
		this.io.inputs.set_count(1);

		// this.ui_data.set_width(100);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);

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
		const box_size = 0.5;
		this.boxShape = new Ammo.btBoxShape(new Ammo.btVector3(box_size, box_size, box_size));
		this.sphereShape = new Ammo.btSphereShape(box_size);
		this.transform = new Ammo.btTransform();
		this._gravity = new Ammo.btVector3(0, 0, 0);
	}

	private _input_objects: Object3D[] | undefined;
	cook(input_contents: CoreGroup[]) {
		if (this.scene.frame == 1) {
			this.reset();
		}
		if (!this._input_objects) {
			this._input_objects = input_contents[0].objects();

			this.init();
			this.createGroundShape();
		}
		if (this._input_objects) {
			this.simulate(0.05);
			this.set_objects(this._input_objects);
		} else {
			this.set_objects([]);
		}
	}

	protected createGroundShape() {
		if (!this.world) {
			return;
		}
		const shape = new Ammo.btBoxShape(new Ammo.btVector3(50, 1, 50));
		const transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin(new Ammo.btVector3(0, -1, 0));

		const localInertia = new Ammo.btVector3(0, 0, 0);
		const myMotionState = new Ammo.btDefaultMotionState(transform);
		const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, shape, localInertia);
		const body = new Ammo.btRigidBody(rbInfo);
		body.setRestitution(1);

		this.world.addRigidBody(body);
		this.bodies.push(body);
	}
	private init() {
		if (!(this.boxShape && this.sphereShape && this.world && this._gravity && this._input_objects)) {
			return;
		}
		this._gravity.setValue(this.pv.gravity.x, this.pv.gravity.y, this.pv.gravity.z);
		this.world.setGravity(this._gravity);

		for (let i = 0; i < this._input_objects.length; i++) {
			const startTransform = new Ammo.btTransform();
			startTransform.setIdentity();
			const mass = 1;
			const localInertia = new Ammo.btVector3(0, 0, 0);
			this.sphereShape.calculateLocalInertia(mass, localInertia);

			const myMotionState = new Ammo.btDefaultMotionState(startTransform);
			const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, this.sphereShape, localInertia);
			const body = new Ammo.btRigidBody(rbInfo);

			this.world.addRigidBody(body);
			this.bodies.push(body);
		}
		this.resetPositions();
	}
	private resetPositions() {
		for (let i = 0; i < this.bodies.length; i++) {
			const body = this.bodies[i];
			if (i == 3) {
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
				const rbd_transform = body.getWorldTransform();
				// const rbd_transform = new Ammo.btTransform();
				// body.getMotionState().getWorldTransform(rbd_transform);
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
				// body.getMotionState().setWorldTransform(rbd_transform);
				// body.setLinearVelocity(new Ammo.btVector3(0, 5, 0));
				// body.applyForce(new Ammo.btVector3(0, 0, 1), new Ammo.btVector3(0, 50, 0));
				// body.applyImpulse()
				// body.applyCentralImpulse(new Ammo.btVector3(0, 0, 50));
				// body.applyCentralLocalForce(new Ammo.btVector3(0, 0, 50)); // seems local to itself
			}
		}
		this._transform_objects_from_physics();
	}
	private simulate(dt: number) {
		if (!this._input_objects) {
			return;
		}

		// this._apply_radial_force();
		this.world?.stepSimulation(dt, this.pv.max_substeps);
		this._move_kinematics();
		this._transform_objects_from_physics();
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
	protected _apply_radial_force() {
		if (!this.transform) {
			return;
		}
		const t = this.transform;
		for (let i = 0; i < this.bodies.length; i++) {
			const body = this.bodies[i];
			body.getMotionState().getWorldTransform(t);

			const o = t.getOrigin();
			const amount = 0.5;
			const impulse = new Ammo.btVector3(-o.x(), -o.y(), -o.z());
			const length = impulse.length();
			if (length > 1) {
				impulse.op_mul(amount / length);
			}
			if (impulse.length() > 0.01) {
				body.applyCentralImpulse(impulse);
			}
		}
	}

	private _transform_objects_from_physics() {
		if (!this._input_objects) {
			return;
		}
		for (let i = 0; i < this._input_objects.length; i++) {
			this.readObject(i, this._input_objects[i]);
		}
	}

	private _read_quat = new Quaternion();
	private _mat4 = new Matrix4();
	public readObject(i: number, object: Object3D) {
		const t = this.transform;
		if (!t) {
			return;
		}
		const body = this.bodies[i];
		if (!body) {
			return;
		}
		body.getMotionState().getWorldTransform(t);

		const o = t.getOrigin();
		const r = t.getRotation();
		this._read_quat.set(r.x(), r.y(), r.z(), r.w());

		this._mat4.identity();
		object.position.set(o.x(), o.y(), o.z());
		object.rotation.setFromQuaternion(this._read_quat);
	}

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
