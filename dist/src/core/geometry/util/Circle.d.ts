import { Vector2 } from 'three/src/math/Vector2';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare class CoreGeometryUtilCircle {
    static positions(radius: number, segments_count: number, arc_angle?: number): Vector2[];
    static create(radius: number, segments_count: number, arc_angle?: number): BufferGeometry;
}
