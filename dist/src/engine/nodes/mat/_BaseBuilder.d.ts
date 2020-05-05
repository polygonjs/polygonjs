import { TypedMatNode } from './_Base';
import { GlAssemblerController } from '../gl/code/Controller';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShaderAssemblerMaterial } from '../gl/code/assemblers/materials/_BaseMaterial';
import { GlNodeChildrenMap } from '../../poly/registers/nodes/Gl';
import { BaseGlNodeType } from '../gl/_Base';
import { ShaderMaterialWithCustomMaterials } from '../../../core/geometry/Material';
import { NodeContext } from '../../poly/NodeContext';
export declare abstract class TypedBuilderMatNode<A extends ShaderAssemblerMaterial, K extends NodeParamsConfig> extends TypedMatNode<ShaderMaterialWithCustomMaterials, K> {
    protected _assembler_controller: GlAssemblerController<A> | undefined;
    protected _children_controller_context: NodeContext;
    initialize_base_node(): void;
    create_material(): ShaderMaterialWithCustomMaterials;
    get assembler_controller(): GlAssemblerController<A>;
    protected abstract _create_assembler_controller(): GlAssemblerController<A>;
    create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K];
    children(): BaseGlNodeType[];
    nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][];
    compile_if_required(): void;
    protected _compile(): void;
}
export declare type BaseBuilderMatNodeType = TypedBuilderMatNode<ShaderAssemblerMaterial, NodeParamsConfig>;
