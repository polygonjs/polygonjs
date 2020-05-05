import { CorePoint } from '../Point';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
export declare abstract class CoreGeometryBuilderBase {
    from_points(points: CorePoint[]): BufferGeometry;
    protected abstract _filter_points(points: CorePoint[]): CorePoint[];
    protected abstract _indices_from_points(new_index_by_old_index: Dictionary<number>, old_geometry: BufferGeometry): number[] | undefined;
}
