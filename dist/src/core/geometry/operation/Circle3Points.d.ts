import { Vector3 } from 'three/src/math/Vector3';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare enum PointsCountMode {
    SEGMENTS_COUNT = "segments count",
    SEGMENTS_LENGTH = "segments length"
}
export declare const POINTS_COUNT_MODE: PointsCountMode[];
export declare enum JoinMode {
    ABC = "abc",
    ACB = "acb",
    AB = "ab",
    BC = "bc",
    AC = "ac"
}
export declare const JOIN_MODES: JoinMode[];
interface Circle3PointsParameters {
    arc: boolean;
    center: boolean;
    points_count_mode: PointsCountMode;
    segments_length: number;
    segments_count: number;
    full: boolean;
    join_mode: JoinMode;
    add_id_attribute: boolean;
    add_idn_attribute: boolean;
}
interface CreatedGeometries {
    arc?: BufferGeometry;
    center?: BufferGeometry;
}
export declare class Circle3Points {
    private params;
    private a;
    private b;
    private c;
    private an;
    private bn;
    private cn;
    private ac;
    private ab;
    private ab_x_ac;
    private part0;
    private part1;
    private divider;
    private a_center;
    private center;
    private normal;
    private radius;
    private x;
    private y;
    private z;
    private angle_ab;
    private angle_ac;
    private angle_bc;
    private angle;
    private x_rotated;
    private _created_geometries;
    constructor(params: Circle3PointsParameters);
    created_geometries(): CreatedGeometries;
    create(a: Vector3, b: Vector3, c: Vector3): void;
    private _create_arc;
    private _create_center;
    private _compute_axis;
    private _compute_angle;
    private _points_count;
    private _set_x_from_join_mode;
    private _set_angle_from_join_mode;
}
export {};
