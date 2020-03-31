import { Object3D } from 'three/src/core/Object3D';
import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
export declare class ObjectContainer extends TypedContainer<ContainableMap['OBJECT']> {
    set_content(content: ContainableMap['OBJECT']): void;
    set_object(object: Object3D): void;
    has_object(): boolean;
    object(): Object3D;
}
