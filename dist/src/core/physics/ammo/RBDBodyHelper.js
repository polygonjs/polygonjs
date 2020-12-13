import Ammo from "ammojs-typed";
import {CollisionFlag} from "./Constant";
import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Quaternion as Quaternion2} from "three/src/math/Quaternion";
import {Matrix4 as Matrix42} from "three/src/math/Matrix4";
import {TypeAssert} from "../../../engine/poly/Assert";
export var RBDAttribute;
(function(RBDAttribute2) {
  RBDAttribute2["ACTIVE"] = "active";
  RBDAttribute2["ANGULAR_DAMPING"] = "angular_damping";
  RBDAttribute2["DAMPING"] = "damping";
  RBDAttribute2["FRICTION"] = "friction";
  RBDAttribute2["ID"] = "id";
  RBDAttribute2["MASS"] = "mass";
  RBDAttribute2["RESTITUTION"] = "restitution";
  RBDAttribute2["SIMULATED"] = "simulated";
  RBDAttribute2["SHAPE"] = "shape";
  RBDAttribute2["SHAPE_SIZE_SPHERE"] = "shape_size_sphere";
  RBDAttribute2["SHAPE_SIZE_BOX"] = "shape_size_box";
})(RBDAttribute || (RBDAttribute = {}));
export var RBDShape;
(function(RBDShape2) {
  RBDShape2["BOX"] = "box";
  RBDShape2["SPHERE"] = "sphere";
})(RBDShape || (RBDShape = {}));
export const RBD_SHAPES = [
  RBDShape.BOX,
  RBDShape.SPHERE
];
export class AmmoRBDBodyHelper {
  constructor() {
    this._default_shape_size_box = [1, 1, 1];
    this._t = new Vector32();
    this._q = new Quaternion2();
    this._s = new Vector32();
    this._read_t = new Ammo.btTransform();
    this._read_quat = new Quaternion2();
    this._read_mat4 = new Matrix42();
  }
  create_body(core_object) {
    let mass = this.read_object_attribute(core_object, RBDAttribute.MASS, 1);
    const shape_index = this.read_object_attribute(core_object, RBDAttribute.SHAPE, RBD_SHAPES.indexOf(RBDShape.BOX));
    const restitution = this.read_object_attribute(core_object, RBDAttribute.RESTITUTION, 1);
    const damping = this.read_object_attribute(core_object, RBDAttribute.DAMPING, 1);
    const angular_damping = this.read_object_attribute(core_object, RBDAttribute.ANGULAR_DAMPING, 1);
    const friction = this.read_object_attribute(core_object, RBDAttribute.FRICTION, 0.5);
    const startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    const localInertia = new Ammo.btVector3(0, 0, 0);
    const shape = this._find_or_create_shape(RBD_SHAPES[shape_index], core_object);
    shape.calculateLocalInertia(mass, localInertia);
    const motion_state = new Ammo.btDefaultMotionState(startTransform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motion_state, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setRestitution(restitution);
    body.setDamping(damping, angular_damping);
    body.setFriction(friction);
    return body;
  }
  finalize_body(body, core_object) {
    const active = this.read_object_attribute(core_object, RBDAttribute.ACTIVE, true);
    if (!active) {
      this.make_kinematic(body);
    }
    this.transform_body_from_core_object(body, core_object);
    return body;
  }
  make_kinematic(body) {
    body.setCollisionFlags(CollisionFlag.KINEMATIC_OBJECT);
  }
  make_active(body, world) {
    body.setCollisionFlags(0);
  }
  is_kinematic(body) {
    return body.isKinematicObject();
  }
  is_active(body) {
    return !this.is_kinematic(body);
  }
  transform_body_from_core_object(body, core_object) {
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
  transform_core_object_from_body(object, body) {
    body.getMotionState().getWorldTransform(this._read_t);
    const o = this._read_t.getOrigin();
    const r = this._read_t.getRotation();
    this._read_quat.set(r.x(), r.y(), r.z(), r.w());
    this._read_mat4.identity();
    object.position.set(o.x(), o.y(), o.z());
    object.rotation.setFromQuaternion(this._read_quat);
  }
  _find_or_create_shape(shape, core_object) {
    switch (shape) {
      case RBDShape.BOX: {
        const shape_size = this.read_object_attribute(core_object, RBDAttribute.SHAPE_SIZE_BOX, this._default_shape_size_box);
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
  read_object_attribute(core_object, attrib_name, default_value) {
    const val = core_object.attrib_value(attrib_name);
    if (val == null) {
      return default_value;
    } else {
      return val;
    }
  }
}
