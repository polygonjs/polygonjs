import { CoreGroup } from '../../geometry/Group';
import { BaseOperation } from '../_Base';
import { NodeContext } from '../../../engine/poly/NodeContext';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { ObjectType, ObjectByObjectType } from '../../geometry/Constant';
import { Material } from 'three/src/materials/Material';
import { Object3D } from 'three/src/core/Object3D';
export declare class BaseSopOperation extends BaseOperation {
    static context(): NodeContext;
    cook(input_contents: CoreGroup[], params: any): CoreGroup | Promise<CoreGroup> | void;
    protected create_core_group_from_objects(objects: Object3D[]): CoreGroup;
    protected create_core_group_from_geometry(geometry: BufferGeometry, type?: ObjectType): CoreGroup;
    protected create_object<OT extends ObjectType>(geometry: BufferGeometry, type: OT, material?: Material): ObjectByObjectType[OT];
    static create_object<OT extends ObjectType>(geometry: BufferGeometry, type: OT, material?: Material): ObjectByObjectType[OT];
    protected create_index_if_none(geometry: BufferGeometry): void;
    static create_index_if_none(geometry: BufferGeometry): void;
}
