import { TypedGlNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ShadersCollectionController } from './code/utils/ShadersCollectionController';
declare class InstanceTransformGlParamsConfig extends NodeParamsConfig {
    position: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    normal: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    instance_position: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    instance_orientation: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR4>;
    instance_scale: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
}
export declare class InstanceTransformGlNode extends TypedGlNode<InstanceTransformGlParamsConfig> {
    params_config: InstanceTransformGlParamsConfig;
    static type(): string;
    initialize_node(): void;
    set_lines(shaders_collection_controller: ShadersCollectionController): void;
    gl_output_name_position(): string;
    gl_output_name_normal(): string;
    private _default_position;
    private _default_normal;
    private _default_instance_position;
    private _default_input_instance_orientation;
    private _default_input_instance_scale;
}
export {};
