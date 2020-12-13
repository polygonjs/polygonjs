import Ammo from 'ammojs-typed';
import { CorePoint } from '../../geometry/Point';
export declare enum ForceType {
    DIRECTIONAL = "directional",
    RADIAL = "radial"
}
export declare const FORCE_TYPES: Array<ForceType>;
export declare const FORCE_TYPE_ATTRIBUTE_NAME = "force_type";
export declare enum PhysicsForceType {
    DIRECTIONAL = "directional",
    RADIAL = "radial"
}
export declare enum DirectionalForceAttribute {
    DIRECTION = "direction"
}
export declare enum RadialForceAttribute {
    CENTER = "center",
    AMOUNT = "amount",
    MAX_DISTANCE = "max_distance",
    MAX_SPEED = "max_speed"
}
export declare const FORCE_DEFAULT_ATTRIBUTE_VALUES: {
    directional: {
        direction: Number3;
    };
    radial: {
        center: Number3;
        amount: number;
        max_distance: number;
        max_speed: number;
    };
};
export declare class AmmoForceHelper {
    apply_force(core_point: CorePoint, bodies: Ammo.btRigidBody[]): void;
    private _apply_force_to_body;
    private _t;
    private _impulse;
    private _apply_directional_force_to_body;
    private _apply_radial_force_to_body;
}
