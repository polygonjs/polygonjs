import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { CoreGeometryBuilderBase } from './_Base';
import { CorePoint } from '../Point';
export declare class CoreGeometryBuilderLineSegments extends CoreGeometryBuilderBase {
    protected _filter_points(points: CorePoint[]): CorePoint[];
    protected _indices_from_points(new_index_by_old_index: Dictionary<number>, old_geometry: BufferGeometry): number[] | undefined;
}
