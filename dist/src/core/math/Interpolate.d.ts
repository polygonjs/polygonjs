import { Vector3 } from 'three/src/math/Vector3';
import { CorePoint } from '../geometry/Point';
export declare class CoreInterpolate {
    static perform(point_dest: CorePoint, points_src: CorePoint[], attrib_name: string, distance_threshold: number, blend_with: number): number;
    static _interpolate_with_1_point(point_dest: CorePoint, point_src: CorePoint, attrib_name: string, distance_threshold: number, blend_with: number): number;
    static _weight_from_distance(distance: number, distance_threshold: number, blend_with: number): number;
    static _weighted_value_from_distance(point_dest: CorePoint, value_src: number, attrib_name: string, distance: number, distance_threshold: number, blend_with: number): number;
    static _interpolate_with_multiple_points(point_dest: CorePoint, points_src: CorePoint[], attrib_name: string, distance_threshold: number, blend_with: number): number;
    static weights(current_position: Vector3, other_positions: Vector3[]): number[] | 1;
    static _weights_from_2(current_position: Vector3, other_positions: Vector3[]): number[];
    static _weights_from_3(current_position: Vector3, other_positions: Vector3[]): number[];
}
