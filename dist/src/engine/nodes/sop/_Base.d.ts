import { Object3D } from 'three/src/core/Object3D';
import { Material } from 'three/src/materials/Material';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { TypedNode } from '../_Base';
import { ObjectByObjectType } from '../../../core/geometry/Constant';
import { CoreGroup } from '../../../core/geometry/Group';
import { ObjectType } from '../../../core/geometry/Constant';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { FlagsControllerDB } from '../utils/FlagsController';
declare enum MESSAGE {
    FROM_SET_CORE_GROUP = "from set_core_group",
    FROM_SET_GROUP = "from set_group",
    FROM_SET_OBJECTS = "from set_objects",
    FROM_SET_OBJECT = "from set_object",
    FROM_SET_GEOMETRIES = "from set_geometries",
    FROM_SET_GEOMETRY = "from set_geometry"
}
export declare class TypedSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
    static node_context(): NodeContext;
    readonly flags: FlagsControllerDB;
    static displayed_input_names(): string[];
    initialize_base_node(): void;
    set_core_group(core_group: CoreGroup): void;
    set_object(object: Object3D): void;
    set_objects(objects: Object3D[]): void;
    set_geometry(geometry: BufferGeometry, type?: ObjectType): void;
    set_geometries(geometries: BufferGeometry[], type?: ObjectType): void;
    set_container_objects(objects: Object3D[], message: MESSAGE): void;
    create_object<OT extends ObjectType>(geometry: BufferGeometry, type: OT, material?: Material): ObjectByObjectType[OT];
    protected _create_index_if_none(geometry: BufferGeometry): void;
    protected _add_index(geometry: BufferGeometry): void;
}
export declare type BaseSopNodeType = TypedSopNode<NodeParamsConfig>;
export declare class BaseSopNodeClass extends TypedSopNode<NodeParamsConfig> {
}
export {};
