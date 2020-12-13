import { Material } from 'three/src/materials/Material';
import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
import { NodeContext } from '../poly/NodeContext';
export declare class MaterialContainer extends TypedContainer<NodeContext.MAT> {
    set_content(content: ContainableMap[NodeContext.MAT]): void;
    set_material(material: Material): void;
    has_material(): boolean;
    material(): Material;
}
