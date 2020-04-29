import { Vector3 } from 'three/src/math/Vector3';
import { Triangle } from 'three/src/math/Triangle';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { CorePoint } from './Point';
import { CoreGeometry } from './Geometry';
interface FaceLike {
    a: number;
    b: number;
    c: number;
}
declare type CorePointArray3 = [CorePoint, CorePoint, CorePoint];
declare type Vector3Array2 = [Vector3, Vector3];
declare type Vector3Array3 = [Vector3, Vector3, Vector3];
export declare class CoreFace {
    private _core_geometry;
    private _index;
    _geometry: BufferGeometry;
    _points: CorePointArray3 | undefined;
    _triangle: Triangle | undefined;
    _positions: Vector3Array3 | undefined;
    _deltas: Vector3Array2 | undefined;
    constructor(_core_geometry: CoreGeometry, _index: number);
    get index(): number;
    get points(): CorePointArray3;
    private _get_points;
    get positions(): Vector3Array3;
    private _get_positions;
    get triangle(): Triangle;
    private _get_triangle;
    get deltas(): Vector3Array2;
    private _get_deltas;
    get area(): number;
    center(target: Vector3): Vector3;
    random_position(seed: number): Vector3;
    attrib_value_at_position(attrib_name: string, position: Vector3): number | Vector3 | undefined;
    static interpolated_value(geometry: BufferGeometry, face: FaceLike, intersect_point: Vector3, attrib: BufferAttribute): number | Vector3 | null;
}
export {};
