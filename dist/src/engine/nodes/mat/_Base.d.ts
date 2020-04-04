import { TypedNode } from '../_Base';
import { Material } from 'three/src/materials/Material';
import { MaterialContainer } from '../../containers/Material';
import { Object3D } from 'three/src/core/Object3D';
import { NodeContext } from '../../poly/NodeContext';
import { TypedContainerController } from '../utils/ContainerController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<'MATERIAL', BaseMatNodeType, K> {
    container_controller: TypedContainerController<MaterialContainer>;
    static node_context(): NodeContext;
    protected _material: M | undefined;
    initialize_base_node(): void;
    node_sibbling(name: string): BaseMatNodeType | null;
    private _cook_main_without_inputs_when_dirty_bound;
    private _cook_main_without_inputs_when_dirty;
    private set_material_name;
    abstract create_material(): M;
    get material(): M;
    set_material(material: Material): void;
    add_render_hook(object: Object3D): void;
}
export declare type BaseMatNodeType = TypedMatNode<Material, any>;
export declare class BaseMatNodeClass extends TypedMatNode<Material, any> {
    create_material(): Material;
}
