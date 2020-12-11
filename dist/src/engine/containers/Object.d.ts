import { Object3D } from 'three/src/core/Object3D';
import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare class ObjectContainer extends TypedContainer<NodeContext.OBJ> {
    set_content(content: ContainableMap[NodeContext.OBJ]): void;
    set_object(object: Object3D): void;
    has_object(): boolean;
    object(): Object3D;
}
