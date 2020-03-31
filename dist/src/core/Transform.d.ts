import { Vector3 } from 'three/src/math/Vector3';
import { Quaternion } from 'three/src/math/Quaternion';
import { Object3D } from 'three/src/core/Object3D';
import { Matrix4 } from 'three/src/math/Matrix4';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BaseNodeType } from '../engine/nodes/_Base';
export interface SetParamsFromMatrixOptions {
    scale?: boolean;
}
export declare class CoreTransform {
    static set_params_from_matrix(matrix: Matrix4, node: BaseNodeType, options?: SetParamsFromMatrixOptions): void;
    static set_params_from_object(object: Object3D, node: BaseNodeType): void;
    private _translation_matrix;
    private _translation_matrix_q;
    private _translation_matrix_s;
    translation_matrix(t: Vector3): Matrix4;
    static matrix_quaternion(matrix: Matrix4): Quaternion;
    private _matrix;
    private _matrix_q;
    private _matrix_e;
    private _matrix_s;
    matrix(t: Vector3, r: Vector3, s: Vector3, scale: number): Matrix4;
    private _rotate_geometry_m;
    private _rotate_geometry_q;
    private _rotate_geometry_vec_dest;
    rotate_geometry(geometry: BufferGeometry, vec_origin: Vector3, vec_dest: Vector3): void;
}
