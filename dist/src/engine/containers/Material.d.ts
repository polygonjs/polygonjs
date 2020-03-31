import { Material } from 'three/src/materials/Material';
import { TypedContainer } from './_Base';
import { ContainableMap } from './utils/ContainableMap';
export declare class MaterialContainer extends TypedContainer<ContainableMap['MATERIAL']> {
    set_content(content: ContainableMap['MATERIAL']): void;
    set_material(material: Material): void;
    has_material(): boolean;
    material(): Material;
}
