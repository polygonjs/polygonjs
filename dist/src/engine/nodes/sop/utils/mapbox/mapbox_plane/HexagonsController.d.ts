import { MapboxPlaneSopNode } from '../../../MapboxPlane';
import { Vector2 } from 'three/src/math/Vector2';
export declare class MapboxPlaneHexagonsController {
    private node;
    private _core_transform;
    constructor(node: MapboxPlaneSopNode);
    geometry(plane_dimensions: Vector2, segments_counts: Vector2Like): import("three").BufferGeometry;
}
