import Ammo from 'ammojs-typed';
import {CollisionFlag, BodyState} from './Constant';
import {CoreObject} from '../../geometry/Object';
import {Vector3, Quaternion, Matrix4} from 'three';

export enum RBDAttribute {
	ACTIVE = 'active',
	ANGULAR_DAMPING = 'angular_damping',
	DAMPING = 'damping',
	FRICTION = 'friction',
	MASS = 'mass',
	RESTITUTION = 'restitution',
	SHAPE = 'shape',
	SHAPE_SIZE_SPHERE = 'shape_size_sphere',
	SHAPE_SIZE_BOX = 'shape_size_box',
}
export enum RBDShape {
	BOX = 'box',
	CAPSULE = 'capsule',
	CONE = 'cone',
	CYLINDER = 'cylinder',
	SPHERE = 'sphere',
}
export const RBD_SHAPES: Array<RBDShape> = [
	RBDShape.BOX,
	RBDShape.CAPSULE,
	RBDShape.CONE,
	RBDShape.CYLINDER,
	RBDShape.SPHERE,
];
// also investigate btMultiSphereShape, btConvexHullShape, btCompoundShape, btConcaveShape, btConvexShape,

export class AmmoRBDBodyHelper {
	private _default_shape_size_box: Number3 = [1, 1, 1];
	create_body(core_object: CoreObject) {
		// read attributes
		const active = this._read_object_attribute(core_object, RBDAttribute.ACTIVE, true);
		const mass = this._read_object_attribute(core_object, RBDAttribute.MASS, 1);
		const shape_index = this._read_object_attribute(
			core_object,
			RBDAttribute.SHAPE,
			RBD_SHAPES.indexOf(RBDShape.BOX)
		);
		const restitution = this._read_object_attribute(core_object, RBDAttribute.RESTITUTION, 1);
		const damping = this._read_object_attribute(core_object, RBDAttribute.DAMPING, 1);
		const angular_damping = this._read_object_attribute(core_object, RBDAttribute.ANGULAR_DAMPING, 1);
		const friction = this._read_object_attribute(core_object, RBDAttribute.FRICTION, 0.5);

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
		if (!active) {
			this.make_kinematic(body);
		}

		// set transform
		this._transform_body_from_core_object(body, core_object);

		return body;
	}

	make_kinematic(body: Ammo.btRigidBody) {
		body.setCollisionFlags(CollisionFlag.KINEMATIC_OBJECT);
		body.setActivationState(BodyState.DISABLE_DEACTIVATION);
	}
	is_kinematic(body: Ammo.btRigidBody) {
		return body.getCollisionFlags() == CollisionFlag.KINEMATIC_OBJECT;
	}

	private _t = new Vector3();
	private _q = new Quaternion();
	private _s = new Vector3();
	private _transform_body_from_core_object(body: Ammo.btRigidBody, core_object: CoreObject) {
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

	// private init_active_transform(body: Ammo.btRigidBody) {
	// 	const i = body.getUserIndex();
	// 	const rbd_transform = body.getWorldTransform();
	// 	// const rbd_transform = new Ammo.btTransform();
	// 	// body.getMotionState().getWorldTransform(rbd_transform);
	// 	const origin = rbd_transform.getOrigin();
	// 	origin.setX(2 * i);
	// 	origin.setY(3 * (i + 1));
	// 	// origin.setZ(2.2 * (0.5 - Math.random()));
	// 	const rot = (Math.PI * i) / 4;
	// 	const rotation = rbd_transform.getRotation();
	// 	rotation.setX(rot);
	// 	rotation.setY(rot);
	// 	rotation.setZ(rot);
	// 	// rotation.setY(360 * Math.random());
	// 	// rotation.setZ(360 * Math.random());
	// 	// rotation.setW(360 * Math.random());
	// 	rotation.normalize();
	// 	rbd_transform.setRotation(rotation);
	// 	body.setRestitution(0.8);
	// 	body.setDamping(0, 0.5);
	// 	// body.getMotionState().setWorldTransform(rbd_transform);
	// 	// body.setLinearVelocity(new Ammo.btVector3(0, 5, 0));
	// 	// body.applyForce(new Ammo.btVector3(0, 0, 1), new Ammo.btVector3(0, 50, 0));
	// 	// body.applyImpulse()
	// 	// body.applyCentralImpulse(new Ammo.btVector3(0, 0, 50));
	// 	// body.applyCentralLocalForce(new Ammo.btVector3(0, 0, 50)); // seems local to itself
	// }
	init_kinematic_transform(body: Ammo.btRigidBody) {
		// const rbd_transform = body.getWorldTransform();
		const rbd_transform = new Ammo.btTransform();
		body.getMotionState().getWorldTransform(rbd_transform);
		const origin = rbd_transform.getOrigin();
		origin.setX(2);
		origin.setY(3);
		// origin.setZ(2.2 * (0.5 - Math.random()));
		const rot = (Math.PI * 3) / 4;
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
	}

	private _find_or_create_shape(shape: RBDShape, core_object: CoreObject): Ammo.btCollisionShape {
		switch (shape) {
			case RBDShape.BOX: {
				const shape_size = this._read_object_attribute(
					core_object,
					RBDAttribute.SHAPE_SIZE_BOX,
					this._default_shape_size_box
				);
				const size_v = new Ammo.btVector3(shape_size[0] * 0.5, shape_size[1] * 0.5, shape_size[2] * 0.5);
				return new Ammo.btBoxShape(size_v);
			}
			case RBDShape.SPHERE: {
				const shape_size = this._read_object_attribute(core_object, RBDAttribute.SHAPE_SIZE_SPHERE, 0.5);
				return new Ammo.btSphereShape(shape_size * 0.5);
			}
			default: {
				return new Ammo.btSphereShape(1 * 0.5);
			}
		}
	}

	private _read_object_attribute<A extends AttribValue>(
		core_object: CoreObject,
		attrib_name: string,
		default_value: A
	): A {
		const val = core_object.attrib_value(attrib_name) as A;
		if (val == null) {
			return default_value;
		} else {
			return val;
		}
	}
}
