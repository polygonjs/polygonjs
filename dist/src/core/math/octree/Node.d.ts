import { Vector3 } from 'three/src/math/Vector3';
import { Sphere } from 'three/src/math/Sphere';
import { Box3 } from 'three/src/math/Box3';
import { CorePoint } from '../../geometry/Point';
export declare type OctreeNodeTraverseCallback = (node: OctreeNode) => void;
export declare class OctreeNode {
    private _bbox;
    private _level;
    _leaves_by_octant: Dictionary<OctreeNode>;
    _points_by_octant_id: Dictionary<CorePoint[]>;
    _leaves: OctreeNode[];
    _center: Vector3;
    _bounding_boxes_by_octant: Dictionary<Box3>;
    _bounding_boxes_by_octant_prepared: boolean;
    constructor(_bbox: Box3, _level?: number);
    level(): number;
    traverse(callback: OctreeNodeTraverseCallback): void;
    intersects_sphere(sphere: Sphere): boolean;
    points_in_sphere(sphere: Sphere, accumulated_points: CorePoint[]): void;
    bounding_box(): Box3 | undefined;
    set_points(points: CorePoint[]): void;
    create_leaf(octant_id: string): void;
    add_point(point: CorePoint): void;
    private _octant_id;
    _leaf_bbox(octant_id: string): Box3;
    private _bbox_center;
    private _prepare_leaves_bboxes;
}
