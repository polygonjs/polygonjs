import { PolyScene } from '../PolyScene';
import { BaseNodeType } from '../../nodes/_Base';
import { TypedPathParam } from '../../params/_BasePath';
declare type BasePathParam = TypedPathParam<any>;
export declare class ReferencesController {
    protected scene: PolyScene;
    private _referenced_nodes_by_src_param_id;
    private _referencing_params_by_referenced_node_id;
    private _referencing_params_by_all_named_node_ids;
    constructor(scene: PolyScene);
    set_reference_from_param(src_param: BasePathParam, referenced_node: BaseNodeType): void;
    set_named_nodes_from_param(src_param: BasePathParam): void;
    reset_reference_from_param(src_param: BasePathParam): void;
    referencing_params(node: BaseNodeType): BasePathParam[] | undefined;
    referencing_nodes(node: BaseNodeType): BaseNodeType[] | undefined;
    nodes_referenced_by(node: BaseNodeType): BaseNodeType[];
    private _check_param;
    notify_name_updated(node: BaseNodeType): void;
    notify_params_updated(node: BaseNodeType): void;
}
export {};
