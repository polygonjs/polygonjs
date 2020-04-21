import Ammo from 'ammojs-typed';
import {CollisionFlag} from './Constant';
import {CoreObject} from '../../geometry/Object';
import {Vector3} from 'three/src/math/Vector3';
import {Quaternion} from 'three/src/math/Quaternion';
import {Matrix4} from 'three/src/math/Matrix4';
import {TypeAssert} from '../../../engine/poly/Assert';

export enum RBDAttribute {
	ACTIVE = 'active',
	ANGULAR_DAMPING = 'angular_damping',
	DAMPING = 'damping',
	FRICTION = 'friction',
	ID = 'id',
	MASS = 'mass',
	RESTITUTION = 'restitution',
	SHAPE = 'shape',
	SHAPE_SIZE_SPHERE = 'shape_size_sphere',
	SHAPE_SIZE_BOX = 'shape_size_box',
}
export enum RBDShape {
	BOX = 'box',
	// CAPSULE = 'capsule',
	// CONE = 'cone',
	// CYLINDER = 'cylinder',
	SPHERE = 'sphere',
}
export const RBD_SHAPES: Array<RBDShape> = [
	RBDShape.BOX,
	// RBDShape.CAPSULE,
	// RBDShape.CONE,
	// RBDShape.CYLINDER,
	RBDShape.SPHERE,
];
// also investigate btMultiSphereShape, btConvexHullShape, btCompoundShape, btConcaveShape, btConvexShape,

export class AmmoRBDBodyHelper {
	private _default_shape_size_box: Number3 = [1, 1, 1];
	create_body(core_object: CoreObject) {
		// read attributes

		let mass = this.read_object_attribute<number>(core_object, RBDAttribute.MASS, 1);
		// if (!active) {
		// 	mass = 0;
		// }
		const shape_index = this.read_object_attribute<number>(
			core_object,
			RBDAttribute.SHAPE,
			RBD_SHAPES.indexOf(RBDShape.BOX)
		);
		const restitution = this.read_object_attribute<number>(core_object, RBDAttribute.RESTITUTION, 1);
		const damping = this.read_object_attribute<number>(core_object, RBDAttribute.DAMPING, 1);
		const angular_damping = this.read_object_attribute<number>(core_object, RBDAttribute.ANGULAR_DAMPING, 1);
		const friction = this.read_object_attribute<number>(core_object, RBDAttribute.FRICTION, 0.5);

		// create body
		const startTransform = new Ammo.btTransform();
		startTransform.setIdentity();
		const localInertia = new Ammo.btVector3(0, 0, 0);

		const shape = this._find_or_create_shape(RBD_SHAPES[shape_index], core_object);

		shape.calculateLocalInertia(mass, localInertia);
		const motion_state = new Ammo.btDefaultMotionState(startTransform);
		const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motion_state, shape, localInertia);
		const body = new Ammo.btRigidBody(rbInfo);

		// apply attributes
		body.setRestitution(restitution);
		body.setDamping(damping, angular_damping);
		body.setFriction(friction);
		return body;
	}
	// It is crucial to make the body kinematic AFTER it being added to the physics world.
	// Otherwise, when it switches state, such as starting kinematic and then becoming dynamic,
	// It will not be assigned to the correct collition group, and therefore will not collide with
	// static bodies
	finalize_body(body: Ammo.btRigidBody, core_object: CoreObject) {
		const active = this.read_object_attribute<boolean>(core_object, RBDAttribute.ACTIVE, true);
		if (!active) {
			//} || mass == 0) {
			this.make_kinematic(body);
		}

		// set transform
		this.transform_body_from_core_object(body, core_object);

		return body;
	}

	make_kinematic(body: Ammo.btRigidBody) {
		body.setCollisionFlags(CollisionFlag.KINEMATIC_OBJECT);
		// body.setActivationState(BodyState.DISABLE_DEACTIVATION);
	}
	make_active(body: Ammo.btRigidBody, world: Ammo.btDiscreteDynamicsWorld) {
		body.setCollisionFlags(0);
		// body.setActivationState(BodyState.ACTIVE_TAG);
		// body.activate(true);
		// body.setMassProps(1, new Ammo.btVector3(0, 0, 0));
		// body.setGravity(world.getGravity());
	}
	is_kinematic(body: Ammo.btRigidBody) {
		return body.isKinematicObject();
		// return body.getCollisionFlags() == CollisionFlag.KINEMATIC_OBJECT;
	}
	is_active(body: Ammo.btRigidBody) {
		// return body.isActive();
		return !this.is_kinematic(body);
	}

	private _t = new Vector3();
	private _q = new Quaternion();
	private _s = new Vector3();
	transform_body_from_core_object(body: Ammo.btRigidBody, core_object: CoreObject) {
		const matrix = core_object.object().matrix;
		matrix.decompose(this._t, this._q, this._s);

		const rbd_transform = body.getWorldTransform();
		const origin = rbd_transform.getOrigin();
		const rotation = rbd_transform.getRotation();
		origin.setValue(this._t.x, this._t.y, this._t.z);
		rotation.setValue(this._q.x, this._q.y, this._q.z, this._q.w);
		rotation.normalize();
		rbd_transform.setRotation(rotation);

		if (this.is_kinematic(body)) {
			body.getMotionState().setWorldTransform(rbd_transform);
		}
	}
	private _read_t = new Ammo.btTransform();
	private _read_quat = new Quaternion();
	private _read_mat4 = new Matrix4();
	transform_core_object_from_body(core_object: CoreObject, body: Ammo.btRigidBody) {
		body.getMotionState().getWorldTransform(this._read_t);
		const o = this._read_t.getOrigin();
		const r = this._read_t.getRotation();
		this._read_quat.set(r.x(), r.y(), r.z(), r.w());

		this._read_mat4.identity();
		const object = core_object.object();
		object.position.set(o.x(), o.y(), o.z());
		object.rotation.setFromQuaternion(this._read_quat);
	}

	private _find_or_create_shape(shape: RBDShape, core_object: CoreObject): Ammo.btCollisionShape {
		switch (shape) {
			case RBDShape.BOX: {
				const shape_size = this.read_object_attribute(
					core_object,
					RBDAttribute.SHAPE_SIZE_BOX,
					this._default_shape_size_box
				);
				const size_v = new Ammo.btVector3(shape_size[0] * 0.5, shape_size[1] * 0.5, shape_size[2] * 0.5);
				return new Ammo.btBoxShape(size_v);
			}
			case RBDShape.SPHERE: {
				const shape_size = this.read_object_attribute(core_object, RBDAttribute.SHAPE_SIZE_SPHERE, 0.5);
				return new Ammo.btSphereShape(shape_size * 0.5);
			}
		}
		TypeAssert.unreachable(shape);
	}

	read_object_attribute<A extends AttribValue>(core_object: CoreObject, attrib_name: string, default_value: A): A {
		const val = core_object.attrib_value(attrib_name) as A;
		if (val == null) {
			return default_value;
		} else {
			return val;
		}
	}
}
