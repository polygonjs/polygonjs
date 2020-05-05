import { TypedObjNode } from './_Base';
import { FlagsControllerD } from '../utils/FlagsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { HierarchyController } from './utils/HierarchyController';
import { Mesh } from 'three/src/objects/Mesh';
declare class RivetObjParamConfig extends NodeParamsConfig {
    object: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    point_index: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class RivetObjNode extends TypedObjNode<Mesh, RivetObjParamConfig> {
    params_config: RivetObjParamConfig;
    static type(): Readonly<'rivet'>;
    readonly hierarchy_controller: HierarchyController;
    readonly flags: FlagsControllerD;
    private _helper;
    private _resolved_sop_group;
    private _found_point_post;
    create_object(): Mesh;
    initialize_node(): void;
    cook(): Promise<void>;
    private _add_render_hook;
    private _on_object_before_render_bound;
    private _on_object_before_render;
    static PARAM_CALLBACK_update_resolved_object(node: RivetObjNode): void;
    private _update_resolved_object;
    private _resolved_object;
    static PARAM_CALLBACK_update_active_state(node: RivetObjNode): void;
    private _update_active_state;
}
export {};
