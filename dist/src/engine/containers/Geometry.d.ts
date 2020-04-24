import { Vector3 } from 'three/src/math/Vector3';
import { Box3 } from 'three/src/math/Box3';
import { TypedContainer } from './_Base';
import { CoreGroup } from '../../core/geometry/Group';
import { Object3D } from 'three/src/core/Object3D';
import { ContainableMap } from './utils/ContainableMap';
import { AttribType } from '../../core/geometry/Constant';
export declare class GeometryContainer extends TypedContainer<ContainableMap['GEOMETRY']> {
    set_objects(objects: Object3D[]): void;
    core_content_cloned(): CoreGroup | undefined;
    set_content(content: ContainableMap['GEOMETRY']): void;
    private first_object;
    private first_core_object;
    private first_geometry;
    objects_count(): number;
    objects_visible_count(): number;
    objects_count_by_type(): Dictionary<number>;
    objects_names_by_type(): Dictionary<string[]>;
    point_attribute_names(): string[];
    point_attribute_sizes_by_name(): Dictionary<number>;
    object_attribute_sizes_by_name(): Dictionary<number>;
    point_attribute_types_by_name(): Dictionary<AttribType>;
    object_attribute_types_by_name(): Dictionary<AttribType>;
    object_attribute_names(): string[];
    points_count(): number;
    bounding_box(): Box3;
    center(): Vector3;
    size(): Vector3;
}
