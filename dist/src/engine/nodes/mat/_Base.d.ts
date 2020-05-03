import { TypedNode } from '../_Base';
import { Material } from 'three/src/materials/Material';
import { NodeContext } from '../../poly/NodeContext';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<NodeContext.MAT, K> {
    static node_context(): NodeContext;
    protected _material: M | undefined;
    initialize_base_node(): void;
    private _cook_main_without_inputs_when_dirty_bound;
    private _cook_main_without_inputs_when_dirty;
    private set_material_name;
    abstract create_material(): M;
    get material(): M;
    set_material(material: Material): void;
}
export declare type BaseMatNodeType = TypedMatNode<Material, any>;
export declare class BaseMatNodeClass extends TypedMatNode<Material, any> {
    create_material(): Material;
}
