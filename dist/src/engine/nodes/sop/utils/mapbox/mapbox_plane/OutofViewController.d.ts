import { MapboxPlaneSopNode } from '../../../MapboxPlane';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Vector2 } from 'three/src/math/Vector2';
import { MapboxCameraObjNode } from '../../../../obj/MapboxCamera';
import { CoreMapboxTransform } from '../../../../../../core/mapbox/Transform';
import { CoreGeometry } from '../../../../../../core/geometry/Geometry';
export declare class MapboxPlaneFrustumController {
    protected node: MapboxPlaneSopNode;
    constructor(node: MapboxPlaneSopNode);
    delete_out_of_view(geometry: BufferGeometry, core_geo: CoreGeometry, camera_node: MapboxCameraObjNode, transformer: CoreMapboxTransform, plane_dimensions: Vector2, segments_counts: Vector2Like): BufferGeometry | null | undefined;
    private _triangle_a;
    private _triangle_b;
    private _point_pos;
    private _delete_out_of_view;
}
