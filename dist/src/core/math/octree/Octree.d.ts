import { Vector3 } from 'three/src/math/Vector3';
import { Box3 } from 'three/src/math/Box3';
import { CorePoint } from '../../geometry/Point';
import { OctreeNodeTraverseCallback } from './Node';
export declare class CoreOctree {
    private _root;
    constructor(bbox: Box3);
    set_points(points: CorePoint[]): void;
    traverse(callback: OctreeNodeTraverseCallback): void;
    find_points(position: Vector3, distance: number, max_points_count?: number): CorePoint[];
}
