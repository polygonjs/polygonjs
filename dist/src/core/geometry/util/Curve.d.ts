import { CorePoint } from '../Point';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare class CoreGeometryUtilCurve {
    static accumulated_curve_point_indices(indices: number[]): number[][];
    static create_line_segment_geometry(points: CorePoint[], indices: number[], attrib_names: string[], attrib_sizes_by_name: Dictionary<number>): BufferGeometry;
    static line_segment_to_geometries(geometry: BufferGeometry): BufferGeometry[];
}
