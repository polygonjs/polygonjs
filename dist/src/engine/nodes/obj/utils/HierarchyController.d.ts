import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
import { TypedObjNode, BaseObjNodeType } from '../_Base';
import { Object3D } from 'three/src/core/Object3D';
declare class HierarchyParamsConfig extends NodeParamsConfig {
}
export declare class HierarchyObjNode extends TypedObjNode<Object3D, HierarchyParamsConfig> {
    readonly hierarchy_controller: HierarchyController;
}
export declare class HierarchyController {
    private node;
    constructor(node: HierarchyObjNode);
    initialize_node(): void;
    static on_input_updated(node: BaseObjNodeType): void;
    on_input_updated(): void;
}
export {};
