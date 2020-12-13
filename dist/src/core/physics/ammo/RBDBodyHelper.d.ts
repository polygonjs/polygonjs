import Ammo from 'ammojs-typed';
import { CoreObject } from '../../geometry/Object';
import { Object3D } from 'three/src/core/Object3D';
export declare enum RBDAttribute {
    ACTIVE = "active",
    ANGULAR_DAMPING = "angular_damping",
    DAMPING = "damping",
    FRICTION = "friction",
    ID = "id",
    MASS = "mass",
    RESTITUTION = "restitution",
    SIMULATED = "simulated",
    SHAPE = "shape",
    SHAPE_SIZE_SPHERE = "shape_size_sphere",
    SHAPE_SIZE_BOX = "shape_size_box"
}
export declare enum RBDShape {
    BOX = "box",
    SPHERE = "sphere"
}
export declare const RBD_SHAPES: Array<RBDShape>;
export declare class AmmoRBDBodyHelper {
    private _default_shape_size_box;
    create_body(core_object: CoreObject): Ammo.btRigidBody;
    finalize_body(body: Ammo.btRigidBody, core_object: CoreObject): Ammo.btRigidBody;
    make_kinematic(body: Ammo.btRigidBody): void;
    make_active(body: Ammo.btRigidBody, world: Ammo.btDiscreteDynamicsWorld): void;
    is_kinematic(body: Ammo.btRigidBody): boolean;
    is_active(body: Ammo.btRigidBody): boolean;
    private _t;
    private _q;
    private _s;
    transform_body_from_core_object(body: Ammo.btRigidBody, core_object: CoreObject): void;
    private _read_t;
    private _read_quat;
    private _read_mat4;
    transform_core_object_from_body(object: Object3D, body: Ammo.btRigidBody): void;
    private _find_or_create_shape;
    read_object_attribute<A extends AttribValue>(core_object: CoreObject, attrib_name: string, default_value: A): A;
}
